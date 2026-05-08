import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { config } from './config';
import { generatePlayerId } from './utils';
import {
  setClientWs, getClientWs,
  createRoom as createRoomInStore, addPlayer, getPlayer,
  broadcastToRoom, getPlayersInRoom, removePlayer, getRoom,
} from './room';
import {
  startGame, confirmWordViewed, startTimer,
  submitVote, startNextRound, endGame, getGameState,
} from './game';
import { getPlayerNumber } from './room';
import { clientMessageSchemas, wsMessageSchema } from '@shared/schemas';

const PORT = config.server.port;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  const playerId = generatePlayerId();
  setClientWs(playerId, ws);

  console.log('New client connected:', playerId);

  // Send the playerId to the client so it can store it
  ws.send(JSON.stringify({ event: 'connected', data: { playerId } }));

  ws.on('message', (raw) => {
    let message: { event: string; data: unknown };
    try {
      message = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ event: 'roomError', data: { code: 'PARSE_ERROR', message: 'Invalid JSON' } }));
      return;
    }

    // Validate envelope
    const envelopeResult = wsMessageSchema.safeParse(message);
    if (!envelopeResult.success) {
      ws.send(JSON.stringify({ event: 'roomError', data: { code: 'INVALID_MESSAGE', message: 'Invalid message format' } }));
      return;
    }

    const { event, data: rawData } = envelopeResult.data;

    // Validate payload with the appropriate schema
    const schema = clientMessageSchemas[event];
    if (schema) {
      const result = schema.safeParse(rawData);
      if (!result.success) {
        ws.send(JSON.stringify({ event: 'roomError', data: { code: 'VALIDATION_ERROR', message: result.error.message } }));
        return;
      }
    }

    console.log(`[${playerId}] ${event}`);

    try {
      handleMessage(playerId, event, rawData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      ws.send(JSON.stringify({ event: 'roomError', data: { code: 'HANDLER_ERROR', message: errorMessage } }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected:', playerId);
    removePlayer(playerId);
  });
});

function handleMessage(playerId: string, event: string, data: any): void {
  // Helper: validate player is in room (except for createRoom/joinRoom)
  const validatePlayerInRoom = (roomId: string): void => {
    const player = getPlayer(playerId);
    if (!player || player.roomId !== roomId) {
      throw new Error('玩家不在该房间');
    }
  };

  switch (event) {
    case 'createRoom': {
      const { config, nickname } = data;
      const room = createRoomInStore(config, playerId, nickname);
      console.log(`Room created: ${room.roomId} by ${nickname}`);

      // Send room info back to host
      const ws = getClientWs(playerId);
      if (ws) {
        ws.send(JSON.stringify({
          event: 'roomCreated',
          data: { roomId: room.roomId, playerId, nickname },
        }));
      }
      broadcastToRoom(room.roomId, 'playerListUpdated', {
        roomId: room.roomId,
        players: getPlayersInRoom(room.roomId),
      });
      break;
    }

    case 'joinRoom': {
      const { roomId, nickname } = data;
      const room = getRoom(roomId);
      if (!room) throw new Error('房间不存在');
      if (room.status === 'PLAYING') throw new Error('游戏已开始，无法加入');
      if (room.status === 'ENDED') throw new Error('游戏已结束');

      addPlayer(roomId, playerId, nickname, false);
      console.log(`${nickname} joined room ${roomId}`);

      // Send success to the joining player
      const player = getPlayer(playerId);
      const ws = getClientWs(playerId);
      if (ws) {
        ws.send(JSON.stringify({
          event: 'roomJoined',
          data: {
            roomId,
            playerId,
            nickname,
            playerNumber: player?.playerNumber,
            config: room.config,
          },
        }));
      }

      // Broadcast updated player list to room
      broadcastToRoom(roomId, 'playerListUpdated', {
        roomId,
        players: getPlayersInRoom(roomId),
      });
      break;
    }

    case 'startGame': {
      const { roomId } = data;
      validatePlayerInRoom(roomId);
      startGame(roomId, playerId);
      break;
    }

    case 'confirmWordViewed': {
      const { roomId } = data;
      validatePlayerInRoom(roomId);
      confirmWordViewed(roomId, playerId);
      break;
    }

    case 'startSpeaking': {
      const { roomId } = data;
      validatePlayerInRoom(roomId);
      const room = getRoom(roomId);
      if (!room || room.hostId !== playerId) throw new Error('只有房主可以操作');
      const state = getGameState(roomId);
      if (state && state.phase === 'SPEAKING') {
        const currentPlayerId = state.speakingOrder[state.currentSpeakerIndex];
        const player = getPlayer(currentPlayerId);
        broadcastToRoom(roomId, 'currentSpeaker', {
          playerId: currentPlayerId,
          playerNumber: player?.playerNumber ?? getPlayerNumber(currentPlayerId),
          nickname: player?.nickname,
        });
      }
      break;
    }

    case 'startTimer': {
      const { roomId, duration } = data;
      validatePlayerInRoom(roomId);
      startTimer(roomId, duration);
      break;
    }

    case 'vote': {
      const { roomId, targetPlayerId } = data;
      validatePlayerInRoom(roomId);
      submitVote(roomId, playerId, targetPlayerId);
      break;
    }

    case 'startNextRound': {
      const { roomId } = data;
      validatePlayerInRoom(roomId);
      startNextRound(roomId, playerId);
      break;
    }

    case 'endGame': {
      const { roomId } = data;
      validatePlayerInRoom(roomId);
      endGame(roomId, playerId);
      break;
    }

    default:
      console.log('Unknown event:', event);
  }
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
});
