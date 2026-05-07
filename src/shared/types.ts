// Room types
export type RoomStatus = 'CREATED' | 'WAITING' | 'PLAYING' | 'ENDED';
export type WordTheme = 'RANDOM' | 'FOOD' | 'ANIMAL' | 'OCCUPATION' | 'LOCATION' | 'LIFE' | 'ENTERTAINMENT';

export interface GameConfig {
  playerCount: number;      // 6-12
  spyCount: number;         // 1-2
  wordTheme: WordTheme;
  voteTimeout: number;      // seconds
  speakTimeout: number;     // seconds
}

export interface Room {
  roomId: string;
  hostId: string;
  config: GameConfig;
  status: RoomStatus;
  createdAt: Date;
}

// Player types
export type PlayerStatus = 'JOINED' | 'READY' | 'SPEAKING' | 'VOTED' | 'ELIMINATED';
export type Identity = 'CIVILIAN' | 'SPY';

export interface Player {
  playerId: string;
  roomId: string;
  nickname: string;
  playerNumber: number;
  isHost: boolean;
  status: PlayerStatus;
  word?: string;
}

// Game Round types
export interface VoteRecord {
  voterId: string;
  targetId: string;
  timestamp: Date;
}

export interface GameRound {
  roundNumber: number;
  roomId: string;
  speakingOrder: string[];
  votes: VoteRecord[];
  eliminatedPlayer?: string;
  civilianWord: string;
  spyWord: string;
  winner?: 'CIVILIAN' | 'SPY';
}

// WebSocket events
export type WSEvent = 
  | 'joinRoom'
  | 'roomJoined'
  | 'playerListUpdated'
  | 'startGame'
  | 'wordAssigned'
  | 'confirmWordViewed'
  | 'allWordsViewed'
  | 'startSpeaking'
  | 'currentSpeaker'
  | 'startTimer'
  | 'timerUpdate'
  | 'timerEnded'
  | 'nextSpeaker'
  | 'startVoting'
  | 'vote'
  | 'votingProgress'
  | 'revealResult'
  | 'hostTransferred'
  | 'roomError';

export interface WSError {
  code: string;
  message: string;
}
