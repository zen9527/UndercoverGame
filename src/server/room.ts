import { WebSocket } from 'ws';
import { Room, Player, GameConfig } from '@shared/types';
import { generateRoomId } from './utils';

// Store rooms in memory
const rooms = new Map<string, Room>();
const players = new Map<string, Player>(); // playerId -> Player
const clientWs = new Map<string, WebSocket>(); // playerId -> WebSocket

// ===== Room CRUD =====

export function createRoom(config: GameConfig, hostPlayerId: string, hostNickname: string): Room {
  const roomId = generateRoomId();
  const room: Room = {
    roomId,
    hostId: hostPlayerId,
    config,
    status: 'WAITING',
    createdAt: new Date(),
  };
  rooms.set(roomId, room);

  // Host is also a player
  addPlayer(roomId, hostPlayerId, hostNickname, true);

  return room;
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId);
}

export function setRoomStatus(roomId: string, status: Room['status']): void {
  const room = rooms.get(roomId);
  if (room) room.status = status;
}

export function removeRoom(roomId: string): void {
  // Clean up all players in the room
  const roomPlayers = getPlayersInRoom(roomId);
  roomPlayers.forEach(p => {
    clientWs.delete(p.playerId);
    players.delete(p.playerId);
  });
  rooms.delete(roomId);
}

// ===== Player management =====

export function addPlayer(roomId: string, playerId: string, nickname: string, isHost: boolean): Player {
  const room = rooms.get(roomId);
  if (!room) throw new Error('房间不存在');

  const playersInRoom = getPlayersInRoom(roomId);
  if (playersInRoom.length >= room.config.playerCount) {
    throw new Error('房间已满');
  }

  // Check duplicate nickname in room
  if (playersInRoom.some(p => p.nickname === nickname)) {
    throw new Error('该昵称已被使用');
  }

  const playerNumber = playersInRoom.length + 1;
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

export function getPlayer(playerId: string): Player | undefined {
  return players.get(playerId);
}

export function getPlayersInRoom(roomId: string): Player[] {
  return Array.from(players.values()).filter(p => p.roomId === roomId);
}

export function setPlayerStatus(playerId: string, status: Player['status']): void {
  const player = players.get(playerId);
  if (player) player.status = status;
}

export function isHost(roomId: string, playerId: string): boolean {
  const room = rooms.get(roomId);
  return room?.hostId === playerId;
}

export function transferHost(roomId: string): string | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const playersInRoom = getPlayersInRoom(roomId);
  
  // Priority 1: Find non-eliminated player who is not the current host
  let nextHost = playersInRoom.find(p => p.playerId !== room.hostId && p.status !== 'ELIMINATED');
  
  // Priority 2: If all remaining are eliminated (edge case), find any player
  if (!nextHost) {
    nextHost = playersInRoom.find(p => p.playerId !== room.hostId);
  }

  if (nextHost) {
    const oldHostId = room.hostId;
    room.hostId = nextHost.playerId;
    // Update host flags
    playersInRoom.forEach(p => {
      p.isHost = (p.playerId === nextHost.playerId);
    });
    
    console.log(`Host transferred from ${oldHostId} to ${nextHost.playerId} in room ${roomId}`);
    return nextHost.playerId;
  }
  
  // No other players left - room will be cleaned up
  console.log(`No valid host transfer candidates in room ${roomId}`);
  return null;
}

export function removePlayer(playerId: string): void {
  const player = players.get(playerId);
  if (player) {
    const room = rooms.get(player.roomId);
    if (room) {
      // If host leaves, transfer host first
      if (room.hostId === playerId) {
        const newHostId = transferHost(player.roomId);
        if (newHostId) {
          broadcastToRoom(player.roomId, 'hostTransferred', { newHostId });
        } else {
          // No valid host - clean up the room
          console.log(`No valid host remaining in room ${player.roomId}, cleaning up`);
          removeRoom(player.roomId);
          return;
        }
      }
    }
    
    // Remove player data
    players.delete(playerId);
    clientWs.delete(playerId);
    
    // Broadcast updated player list if room still exists
    const updatedRoom = rooms.get(player.roomId);
    if (updatedRoom) {
      broadcastToRoom(player.roomId, 'playerListUpdated', {
        roomId: player.roomId,
        players: getPlayersInRoom(player.roomId),
      });
    }
  }
}

// ===== WebSocket helpers =====

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
  return player?.playerNumber ?? 0;
}
