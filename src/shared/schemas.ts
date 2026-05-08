import { z } from 'zod';

// ===== Game Config =====
export const gameConfigSchema = z.object({
  playerCount: z.number().int().min(4).max(12),
  spyCount: z.number().int().min(1).max(2),
  wordTheme: z.enum(['RANDOM', 'FOOD', 'ANIMAL', 'OCCUPATION', 'LOCATION', 'LIFE', 'ENTERTAINMENT']),
  voteTimeout: z.number().int().min(10).max(120),
  speakTimeout: z.number().int().min(10).max(60),
});
export type GameConfigInput = z.infer<typeof gameConfigSchema>;

// ===== Client → Server Messages =====
export const createRoomSchema = z.object({
  config: gameConfigSchema,
  nickname: z.string().min(1).max(20),
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(4).max(10),
  nickname: z.string().min(1).max(20),
});

export const startGameSchema = z.object({
  roomId: z.string().min(1),
});

export const confirmWordViewedSchema = z.object({
  roomId: z.string().min(1),
});

export const startSpeakingSchema = z.object({
  roomId: z.string().min(1),
});

export const startTimerSchema = z.object({
  roomId: z.string().min(1),
  duration: z.number().int().min(5).max(120),
});

export const voteSchema = z.object({
  roomId: z.string().min(1),
  targetPlayerId: z.string().min(1),
});

export const startNextRoundSchema = z.object({
  roomId: z.string().min(1),
});

export const endGameSchema = z.object({
  roomId: z.string().min(1),
});

// ===== Generic WS Message Envelope =====
export const wsMessageSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});

// ===== Event → Schema mapping for validation =====
export const clientMessageSchemas: Record<string, z.ZodTypeAny> = {
  createRoom: createRoomSchema,
  joinRoom: joinRoomSchema,
  startGame: startGameSchema,
  confirmWordViewed: confirmWordViewedSchema,
  startSpeaking: startSpeakingSchema,
  startTimer: startTimerSchema,
  vote: voteSchema,
  startNextRound: startNextRoundSchema,
  endGame: endGameSchema,
};
