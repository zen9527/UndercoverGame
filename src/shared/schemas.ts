import { z } from 'zod';

export const gameConfigSchema = z.object({
  playerCount: z.number().min(4).max(12),
  spyCount: z.number().min(1).max(2),
  wordTheme: z.enum(['RANDOM', 'FOOD', 'ANIMAL', 'OCCUPATION', 'LOCATION', 'LIFE', 'ENTERTAINMENT']),
  voteTimeout: z.number().min(10).max(120),
  speakTimeout: z.number().min(10).max(60),
});

export type GameConfigInput = z.infer<typeof gameConfigSchema>;

export const createRoomSchema = z.object({
  config: gameConfigSchema,
});

export const joinRoomSchema = z.object({
  roomId: z.string().min(4).max(10),
  nickname: z.string().min(1).max(20),
});

export const voteSchema = z.object({
  targetPlayerId: z.string(),
});

// WebSocket message schema
export const wsMessageSchema = z.object({
  event: z.string(),
  data: z.unknown(),
});
