import { GameState, VoteRecord } from '@shared/types';
import {
  getPlayersInRoom, broadcastToRoom, sendToPlayer,
  getRoom, getPlayer, setPlayerStatus, setRoomStatus,
} from './room';
import { getRandomWordPair } from './wordPool';

const gameStates = new Map<string, GameState>();

// ===== Getters =====

export function getGameState(roomId: string): GameState | undefined {
  return gameStates.get(roomId);
}

// ===== Start Game =====

export function startGame(roomId: string, callerPlayerId: string): void {
  // Validate caller is host
  const room = getRoom(roomId);
  if (!room) throw new Error('房间不存在');
  if (room.hostId !== callerPlayerId) throw new Error('只有房主可以开始游戏');

  const players = getPlayersInRoom(roomId);
  if (players.length < 4) throw new Error('至少需要4名玩家');
  if (room.status === 'PLAYING') throw new Error('游戏正在进行中');

  const [civilianWord, spyWord] = getRandomWordPair(room.config.wordTheme);
  const playerIds = players.map(p => p.playerId);
  const spyCount = Math.min(room.config.spyCount, Math.floor(playerIds.length / 3)); // 安全限制
  const spyIndices = generateSpyIndices(playerIds.length, spyCount);
  const spyPlayerIds = new Set(spyIndices.map(i => playerIds[i]));

  const state: GameState = {
    phase: 'WORD_ASSIGNMENT',
    currentRound: 1,
    speakingOrder: shuffleArray(playerIds),
    currentSpeakerIndex: 0,
    votes: [],
    civilianWord,
    spyWord,
    wordViewedPlayerIds: new Set(),
    spyPlayerIds,
  };
  gameStates.set(roomId, state);
  setRoomStatus(roomId, 'PLAYING');

  // Send words to each player (only their own)
  playerIds.forEach((playerId, index) => {
    const isSpy = spyIndices.includes(index);
    const word = isSpy ? spyWord : civilianWord;
    sendToPlayer(playerId, 'wordAssigned', { word, isSpy });
  });

  broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'WORD_ASSIGNMENT' });
  broadcastToRoom(roomId, 'playerListUpdated', {
    roomId,
    players: getPlayersInRoom(roomId).map(p => ({ ...p, word: undefined })),
  });
}

// ===== Confirm Word Viewed =====

export function confirmWordViewed(roomId: string, playerId: string): void {
  const state = gameStates.get(roomId);
  if (!state || state.phase !== 'WORD_ASSIGNMENT') return;

  const player = getPlayer(playerId);
  if (!player || player.roomId !== roomId) return;

  state.wordViewedPlayerIds.add(playerId);
  console.log(`Player ${playerId} (${player.nickname}) viewed their word. ${state.wordViewedPlayerIds.size}/${state.speakingOrder.length}`);

  // Check if all players have viewed their words
  if (state.wordViewedPlayerIds.size >= state.speakingOrder.length) {
    state.phase = 'SPEAKING';
    broadcastToRoom(roomId, 'allWordsViewed', {});
    broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'SPEAKING' });

    // Auto-start first speaker
    announceCurrentSpeaker(roomId);
  }
}

// ===== Speaking Phase =====

function announceCurrentSpeaker(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) return;

  const currentPlayerId = state.speakingOrder[state.currentSpeakerIndex];
  const player = getPlayer(currentPlayerId);
  if (!player) return;

  broadcastToRoom(roomId, 'currentSpeaker', {
    playerId: currentPlayerId,
    playerNumber: player.playerNumber,
    nickname: player.nickname,
    isCurrentSpeaker: true, // helper for clients
  });
}

export function startTimer(roomId: string, duration: number): void {
  const state = gameStates.get(roomId);
  if (!state || state.phase !== 'SPEAKING') return;

  broadcastToRoom(roomId, 'startTimer', { duration });

  // Countdown broadcast every second
  let remaining = duration;
  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      broadcastToRoom(roomId, 'timerUpdate', { remaining });
    } else {
      clearInterval(interval);
      broadcastToRoom(roomId, 'timerEnded', {});
      nextSpeaker(roomId);
    }
  }, 1000);
}

export function nextSpeaker(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) return;

  state.currentSpeakerIndex++;

  if (state.currentSpeakerIndex >= state.speakingOrder.length) {
    // All players spoke in this round, transition to voting
    state.phase = 'VOTING';
    broadcastToRoom(roomId, 'allSpeakingDone', {});
    broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'VOTING' });
    broadcastToRoom(roomId, 'startVoting', { timeout: getRoom(roomId)?.config.voteTimeout ?? 45 });
  } else {
    announceCurrentSpeaker(roomId);
  }
}

// ===== Voting Phase =====

export function submitVote(roomId: string, voterId: string, targetId: string): void {
  const state = gameStates.get(roomId);
  if (!state || state.phase !== 'VOTING') throw new Error('当前不是投票阶段');

  const voter = getPlayer(voterId);
  if (!voter || voter.roomId !== roomId) throw new Error('玩家不在该房间');

  // Check: eliminated players can't vote
  if (voter.status === 'ELIMINATED') throw new Error('已被淘汰的玩家不能投票');

  // Check: no self-vote
  if (voterId === targetId) throw new Error('不能投给自己');

  // Check: no duplicate vote
  if (state.votes.some(v => v.voterId === voterId)) throw new Error('你已经投过票了');

  // Check: target must be in the same room and not eliminated
  const target = getPlayer(targetId);
  if (!target || target.roomId !== roomId) throw new Error('目标玩家不存在');
  if (target.status === 'ELIMINATED') throw new Error('已被淘汰的玩家不能被投');

  const vote: VoteRecord = {
    voterId,
    targetId,
    timestamp: new Date(),
  };
  state.votes.push(vote);
  setPlayerStatus(voterId, 'VOTED');

  // Broadcast voting progress
  const activePlayers = getPlayersInRoom(roomId).filter(p => p.status !== 'ELIMINATED');
  broadcastToRoom(roomId, 'votingProgress', {
    votedCount: state.votes.length,
    totalVoters: activePlayers.length,
  });

  // Check if all votes are in
  if (state.votes.length >= activePlayers.length) {
    tallyVotes(roomId);
  }
}

export function tallyVotes(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) return;

  // Count votes for each player
  const voteCounts = new Map<string, number>();
  state.votes.forEach(vote => {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) ?? 0) + 1);
  });

  // Find max vote count
  let maxVotes = 0;
  voteCounts.forEach(count => {
    if (count > maxVotes) maxVotes = count;
  });

  // Find all players with max votes (handle tie)
  const topPlayers = Array.from(voteCounts.entries())
    .filter(([, count]) => count === maxVotes)
    .map(([playerId]) => playerId);

  state.phase = 'VOTE_RESULT';
  broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'VOTE_RESULT' });

  if (topPlayers.length > 1) {
    // Tie: no one eliminated, broadcast tie result
    broadcastToRoom(roomId, 'voteResult', {
      isTie: true,
      tiedPlayerIds: topPlayers,
      voteCounts: Object.fromEntries(voteCounts),
    });
  } else {
    const eliminatedPlayerId = topPlayers[0];
    state.eliminatedPlayerId = eliminatedPlayerId;
    setPlayerStatus(eliminatedPlayerId, 'ELIMINATED');

    const eliminatedPlayer = getPlayer(eliminatedPlayerId);
    const isSpy = state.spyPlayerIds.has(eliminatedPlayerId);

    broadcastToRoom(roomId, 'voteResult', {
      isTie: false,
      eliminatedPlayerId,
      eliminatedPlayerNumber: eliminatedPlayer?.playerNumber,
      eliminatedNickname: eliminatedPlayer?.nickname,
      wasSpy: isSpy,
      voteCounts: Object.fromEntries(voteCounts),
    });

    // Check win condition
    const winner = checkWinCondition(roomId, state);
    if (winner) {
      state.winner = winner;
      state.phase = 'GAME_OVER';
      broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'GAME_OVER' });
      broadcastToRoom(roomId, 'gameOver', {
        winner,
        civilianWord: state.civilianWord,
        spyWord: state.spyWord,
        spyPlayerIds: Array.from(state.spyPlayerIds),
      });
      setRoomStatus(roomId, 'ENDED');
    }
  }
}

function checkWinCondition(roomId: string, state: GameState): 'CIVILIAN' | 'SPY' | null {
  const activePlayers = getPlayersInRoom(roomId).filter(p => p.status !== 'ELIMINATED');
  const activeSpyCount = activePlayers.filter(p => state.spyPlayerIds.has(p.playerId)).length;

  // Spy wins if spy count >= civilian count
  if (activeSpyCount >= activePlayers.length - activeSpyCount) return 'SPY';
  // Civilians win if all spies eliminated
  if (activeSpyCount === 0) return 'CIVILIAN';
  return null;
}

// ===== Next Round =====

export function startNextRound(roomId: string, callerPlayerId: string): void {
  const room = getRoom(roomId);
  if (!room || room.hostId !== callerPlayerId) throw new Error('只有房主可以操作');

  const state = gameStates.get(roomId);
  if (!state) throw new Error('游戏未开始');

  // Reset for new round
  const activePlayers = getPlayersInRoom(roomId).filter(p => p.status !== 'ELIMINATED');
  state.currentRound++;
  state.speakingOrder = shuffleArray(activePlayers.map(p => p.playerId));
  state.currentSpeakerIndex = 0;
  state.votes = [];
  state.eliminatedPlayerId = undefined;
  state.wordViewedPlayerIds = new Set();
  state.phase = 'SPEAKING';

  // Reset player statuses
  activePlayers.forEach(p => setPlayerStatus(p.playerId, 'JOINED'));

  broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'SPEAKING' });
  announceCurrentSpeaker(roomId);
}

// ===== End Game =====

export function endGame(roomId: string, callerPlayerId: string): void {
  const room = getRoom(roomId);
  if (!room || room.hostId !== callerPlayerId) throw new Error('只有房主可以操作');

  const state = gameStates.get(roomId);
  if (state) {
    state.phase = 'GAME_OVER';
    broadcastToRoom(roomId, 'gamePhaseChanged', { phase: 'GAME_OVER' });
    broadcastToRoom(roomId, 'gameOver', {
      winner: null,
      civilianWord: state.civilianWord,
      spyWord: state.spyWord,
      spyPlayerIds: Array.from(state.spyPlayerIds),
      reason: 'host_ended',
    });
  }

  setRoomStatus(roomId, 'ENDED');
  gameStates.delete(roomId);
}

// ===== Helper functions =====

function generateSpyIndices(totalPlayers: number, spyCount: number): number[] {
  const indices = Array.from({ length: totalPlayers }, (_, i) => i);
  return shuffleArray(indices).slice(0, spyCount);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
