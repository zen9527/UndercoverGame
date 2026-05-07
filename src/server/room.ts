import { WebSocket } from 'ws';
import { Room, Player, GameConfig } from '@shared/types';
import { generateRoomId } from './utils';

// Store rooms in memory
const rooms = new Map<string, Room>();
const players = new Map<string, Player>(); // playerId -> Player
const clientWs = new Map<string, WebSocket>(); // playerId -> WebSocket

export function createRoom(config: GameConfig, hostPlayerId: string): Room {
  const roomId = generateRoomId();
  const room: Room = {
    roomId,
    hostId: hostPlayerId,
    config,
    status: 'CREATED',
    createdAt: new Date(),
  };
  rooms.set(roomId, room);
  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function addPlayer(roomId: string, playerId: string, nickname: string, isHost: boolean): Player {
  const room = rooms.get(roomId);
  if (!room) throw new Error('Room not found');
  
  const playerNumber = getPlayersInRoom(roomId).length + 1;
  const player: Player = {
    playerId,
    roomId,
    nickname,
    playerNumber,
    isHost,
    status: 'JOINED',
  };
  players.set(playerId, player);
  return player;
}

export function getPlayersInRoom(roomId: string): Player[] {
  return Array.from(players.values()).filter(p => p.roomId === roomId);
}

export function transferHost(roomId: string): string | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  const playersInRoom = getPlayersInRoom(roomId);
  const nextHost = playersInRoom.find(p => p.playerId !== room.hostId && p.status !== 'ELIMINATED');
  
  if (nextHost) {
    room.hostId = nextHost.playerId;
    nextHost.isHost = true;
    return nextHost.playerId;
  }
  return null;
}

export function removePlayer(playerId: string): void {
  const player = players.get(playerId);
  if (player) {
    const room = rooms.get(player.roomId);
    if (room && room.hostId === playerId) {
      transferHost(player.roomId);
    }
    players.delete(playerId);
    clientWs.delete(playerId);
  }
}

export function setClientWs(playerId: string, ws: WebSocket): void {
  clientWs.set(playerId, ws);
}

export function getClientWs(playerId: string): WebSocket | undefined {
  return clientWs.get(playerId);
}

export function broadcastToRoom(roomId: string, event: string, data: unknown): void {
  const playersInRoom = getPlayersInRoom(roomId);
  playersInRoom.forEach(player => {
    const ws = clientWs.get(player.playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  });
}

export function sendToPlayer(playerId: string, event: string, data: unknown): void {
  const ws = clientWs.get(playerId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, data }));
  }
}

export function getPlayerNumber(playerId: string): number {
  const player = players.get(playerId);
  return player?.playerNumber || 0;
}
