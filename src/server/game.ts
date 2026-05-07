import { VoteRecord } from '@shared/types';
import { getPlayersInRoom, broadcastToRoom, sendToPlayer, getPlayerNumber, getRoom } from './room';
import { getRandomWordPair } from './wordPool';

interface GameState {
  currentRound: number;
  speakingOrder: string[];
  currentSpeakerIndex: number;
  votes: VoteRecord[];
  civilianWord: string;
  spyWord: string;
}

const gameStates = new Map<string, GameState>();

export function startGame(roomId: string): void {
  const players = getPlayersInRoom(roomId);
  if (players.length < 4) {
    throw new Error('Not enough players');
  }
  
  // Get room config to determine spy count and word theme
  const room = getRoom(roomId);
  if (!room) throw new Error('Room not found');
  
  const [civilianWord, spyWord] = getRandomWordPair(room.config.wordTheme);
  
  // Assign identities based on config
  const spyCount = room.config.spyCount;
  const playerIds = players.map(p => p.playerId);
  const spyIndices = generateSpyIndices(playerIds.length, spyCount);
  
  // Store game state
  gameStates.set(roomId, {
    currentRound: 1,
    speakingOrder: shuffleArray(playerIds),
    currentSpeakerIndex: 0,
    votes: [],
    civilianWord,
    spyWord,
  });
  
  // Send words to players (only their own)
  playerIds.forEach((playerId, index) => {
    const word = spyIndices.includes(index) ? spyWord : civilianWord;
    sendToPlayer(playerId, 'wordAssigned', { word });
  });
}

export function confirmWordViewed(roomId: string, playerId: string): void {
  // Track when all players have viewed their words
  // When all done, broadcast ready to start speaking
  const state = gameStates.get(roomId);
  if (!state) return;
  
  // TODO: Implement word view tracking
  // For now, just log
  console.log(`Player ${playerId} viewed their word`);
}

export function startSpeaking(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) throw new Error('Game not started');
  
  const currentPlayerId = state.speakingOrder[state.currentSpeakerIndex];
  broadcastToRoom(roomId, 'currentSpeaker', {
    playerId: currentPlayerId,
    playerNumber: getPlayerNumber(currentPlayerId),
  });
}

export function startTimer(roomId: string, duration: number): void {
  // Start countdown timer broadcast
  broadcastToRoom(roomId, 'startTimer', { duration });
  
  // Schedule timer end
  setTimeout(() => {
    broadcastToRoom(roomId, 'timerEnded', {});
    nextSpeaker(roomId);
  }, duration * 1000);
}

export function nextSpeaker(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) return;
  
  state.currentSpeakerIndex++;
  if (state.currentSpeakerIndex >= state.speakingOrder.length) {
    // All players spoke, ready for voting
    broadcastToRoom(roomId, 'allSpeakingDone', {});
  } else {
    const currentPlayerId = state.speakingOrder[state.currentSpeakerIndex];
    broadcastToRoom(roomId, 'currentSpeaker', {
      playerId: currentPlayerId,
      playerNumber: getPlayerNumber(currentPlayerId),
    });
  }
}

export function submitVote(roomId: string, voterId: string, targetId: string): void {
  const state = gameStates.get(roomId);
  if (!state) throw new Error('Game not in voting phase');
  
  const vote: VoteRecord = {
    voterId,
    targetId,
    timestamp: new Date(),
  };
  state.votes.push(vote);
}

export function tallyVotes(roomId: string): void {
  const state = gameStates.get(roomId);
  if (!state) return;
  
  // Count votes for each player
  const voteCounts = new Map<string, number>();
  state.votes.forEach(vote => {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
  });
  
  // Find player with most votes
  let maxVotes = 0;
  let eliminatedPlayer: string | undefined;
  voteCounts.forEach((count, playerId) => {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedPlayer = playerId;
    }
  });
  
  // Reveal result
  broadcastToRoom(roomId, 'revealResult', {
    eliminatedPlayer,
    civilianWord: state.civilianWord,
    spyWord: state.spyWord,
    voteCounts: Object.fromEntries(voteCounts),
  });
}

// Helper functions
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
