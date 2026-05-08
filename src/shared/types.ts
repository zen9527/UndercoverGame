// ===== Room =====
export type RoomStatus = 'CREATED' | 'WAITING' | 'PLAYING' | 'ENDED';
export type WordTheme = 'RANDOM' | 'FOOD' | 'ANIMAL' | 'OCCUPATION' | 'LOCATION' | 'LIFE' | 'ENTERTAINMENT';

export interface GameConfig {
  playerCount: number;      // 4-12
  spyCount: number;         // 1-2
  wordTheme: WordTheme;
  voteTimeout: number;      // seconds, 10-120
  speakTimeout: number;     // seconds, 10-60
}

export interface Room {
  roomId: string;
  hostId: string;
  config: GameConfig;
  status: RoomStatus;
  createdAt: Date;
}

// ===== Player =====
export type PlayerStatus = 'JOINED' | 'READY' | 'SPEAKING' | 'VOTED' | 'ELIMINATED';
export type Identity = 'CIVILIAN' | 'SPY';

export interface Player {
  playerId: string;
  roomId: string;
  nickname: string;
  playerNumber: number;
  isHost: boolean;
  status: PlayerStatus;
  identity?: Identity;  // 只在游戏结束时揭示
  word?: string;
}

// ===== Game State =====
export type GamePhase =
  | 'WAITING'           // 等待开始
  | 'WORD_ASSIGNMENT'   // 词语分配阶段，等待所有人查看
  | 'SPEAKING'          // 发言阶段
  | 'VOTING'            // 投票阶段
  | 'VOTE_RESULT'       // 投票结果（谁被淘汰）
  | 'GAME_OVER';        // 游戏结束

export interface VoteRecord {
  voterId: string;
  targetId: string;
  timestamp: Date;
}

export interface VoteTally {
  playerId: string;
  count: number;
}

export interface GameState {
  phase: GamePhase;
  currentRound: number;
  speakingOrder: string[];
  currentSpeakerIndex: number;
  votes: VoteRecord[];
  civilianWord: string;
  spyWord: string;
  eliminatedPlayerId?: string;
  winner?: 'CIVILIAN' | 'SPY';
  wordViewedPlayerIds: Set<string>;
  spyPlayerIds: Set<string>;
}

// ===== WebSocket Events =====
export type ClientWSEvent =
  | 'createRoom'
  | 'joinRoom'
  | 'startGame'
  | 'confirmWordViewed'
  | 'startSpeaking'
  | 'startTimer'
  | 'vote'
  | 'startNextRound'
  | 'endGame';

export type ServerWSEvent =
  | 'roomCreated'
  | 'roomJoined'
  | 'playerListUpdated'
  | 'gameStarted'
  | 'wordAssigned'
  | 'allWordsViewed'
  | 'currentSpeaker'
  | 'startTimer'
  | 'timerUpdate'
  | 'timerEnded'
  | 'allSpeakingDone'
  | 'startVoting'
  | 'votingProgress'
  | 'voteResult'
  | 'gameOver'
  | 'hostTransferred'
  | 'gamePhaseChanged'
  | 'roomError';

export interface WSError {
  code: string;
  message: string;
}
