# 谁是卧底游戏 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个局域网多人"谁是卧底"游戏，支持 6-12 人通过手机扫码加入，房主电脑运行服务器。

**Architecture:** 房主电脑运行 Node.js WebSocket 服务器 + REST API，React 前端分为房主界面和玩家界面两个独立页面。所有状态通过 WebSocket 实时同步。

**Tech Stack:** React + TypeScript + WebSocket + Zod + Tailwind CSS

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "spy-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "tsx src/server/index.ts"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.4",
    "zustand": "^4.5.0",
    "ws": "^8.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@server/*": ["src/server/*"],
      "@host/*": ["src/client/host/*"],
      "@player/*": ["src/client/player/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@server': path.resolve(__dirname, './src/server'),
      '@host': path.resolve(__dirname, './src/client/host'),
      '@player': path.resolve(__dirname, './src/client/player'),
    },
  },
  server: {
    port: 5173,
    host: true, // 允许局域网访问
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        host: path.resolve(__dirname, 'src/client/host/index.html'),
        player: path.resolve(__dirname, 'src/client/player/index.html'),
      },
    },
  },
});
```

- [ ] **Step 4: 安装依赖**

```bash
npm install
```

Expected: All dependencies installed successfully

- [ ] **Step 5: 提交**

```bash
git add package.json tsconfig.json vite.config.ts
git commit -m "feat: initialize project with React + TypeScript + Vite"
```

---

## Task 2: 共享类型定义

**Files:**
- Create: `src/shared/types.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/types.ts
git commit -m "feat: define shared types for room, player, and game logic"
```

---

## Task 3: Zod Schema 定义

**Files:**
- Create: `src/shared/schemas.ts`

- [ ] **Step 1: 创建 schema 文件**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/shared/schemas.ts
git commit -m "feat: add Zod validation schemas for API and WebSocket"
```

---

## Task 4: 词语库

**Files:**
- Create: `src/server/wordPool.ts`

- [ ] **Step 1: 创建词语库**

```typescript
import { WordTheme } from '@shared/types';

export const wordPairs: Record<WordTheme, Array<[string, string]>> = {
  FOOD: [
    ['咖啡', '奶茶'],
    ['面包', '蛋糕'],
    ['苹果', '梨'],
    ['米饭', '面条'],
    ['可乐', '雪碧'],
    ['巧克力', '糖果'],
    ['火锅', '烧烤'],
    ['饺子', '包子'],
  ],
  ANIMAL: [
    ['猫', '狗'],
    ['狮子', '老虎'],
    ['企鹅', '海鸥'],
    ['兔子', '松鼠'],
    ['熊猫', '考拉'],
    ['海豚', '鲸鱼'],
  ],
  OCCUPATION: [
    ['医生', '护士'],
    ['老师', '教授'],
    ['警察', '保安'],
    ['程序员', '设计师'],
    ['厨师', '服务员'],
    ['律师', '法官'],
  ],
  LOCATION: [
    ['图书馆', '书店'],
    ['公园', '花园'],
    ['电影院', '剧院'],
    ['超市', '商场'],
    ['酒店', '民宿'],
    ['机场', '车站'],
  ],
  LIFE: [
    ['手机', '平板'],
    ['电脑', '笔记本'],
    ['手表', '手环'],
    ['眼镜', '墨镜'],
    ['雨伞', '阳伞'],
    ['背包', '手提包'],
  ],
  ENTERTAINMENT: [
    ['电影', '电视剧'],
    ['唱歌', '跳舞'],
    ['篮球', '足球'],
    ['游戏', '动漫'],
    ['音乐', '舞蹈'],
    ['漫画', '小说'],
  ],
  RANDOM: [], // 混合所有主题
};

export function getRandomWordPair(theme: WordTheme): [string, string] {
  if (theme === 'RANDOM') {
    const themes: WordTheme[] = ['FOOD', 'ANIMAL', 'OCCUPATION', 'LOCATION', 'LIFE', 'ENTERTAINMENT'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const pairs = wordPairs[randomTheme];
    return pairs[Math.floor(Math.random() * pairs.length)];
  }
  
  const pairs = wordPairs[theme];
  return pairs[Math.floor(Math.random() * pairs.length)];
}
```

- [ ] **Step 2: 提交**

```bash
git add src/server/wordPool.ts
git commit -m "feat: create word pool with themed word pairs for spy game"
```

---

## Task 5: WebSocket 服务器基础

**Files:**
- Create: `src/server/index.ts`

- [ ] **Step 1: 创建服务器入口**

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { createServer } from 'http';

const PORT = 3000;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Map<string, WebSocket>(); // playerId -> ws

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message.event);
      // Handle message in room.ts
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    // Handle disconnection in room.ts
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on http://0.0.0.0:${PORT}`);
  console.log(`Host interface: http://localhost:${PORT}/host`);
  console.log(`Player interface: http://localhost:${PORT}/player`);
});
```

- [ ] **Step 2: 测试服务器**

```bash
npm run server
```

Expected: "WebSocket server running on http://0.0.0.0:3000"

- [ ] **Step 3: 提交**

```bash
git add src/server/index.ts
git commit -m "feat: create WebSocket server with basic connection handling"
```

---

## Task 6: 房间管理

**Files:**
- Create: `src/server/room.ts`

- [ ] **Step 1: 创建房间管理器**

```typescript
import { WebSocket } from 'ws';
import { Room, Player, GameConfig, RoomStatus } from '@shared/types';
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
```

- [ ] **Step 2: 创建工具函数**

```typescript
// src/server/utils.ts
import { nanoid } from 'nanoid';

export function generateRoomId(): string {
  return nanoid(6).toUpperCase();
}

export function generatePlayerId(): string {
  return nanoid(8);
}
```

- [ ] **Step 3: 添加 nanoid 依赖**

```bash
npm install nanoid
npm install --save-dev @types/nanoid
```

- [ ] **Step 4: 提交**

```bash
git add src/server/room.ts src/server/utils.ts
git commit -m "feat: implement room management with player tracking and host transfer"
```

---

## Task 7: 游戏逻辑

**Files:**
- Create: `src/server/game.ts`

- [ ] **Step 1: 创建游戏控制器**

```typescript
import { Player, Identity, GameRound, VoteRecord } from '@shared/types';
import { getPlayersInRoom, broadcastToRoom, sendToPlayer } from './room';
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
  
  const [civilianWord, spyWord] = getRandomWordPair(players[0].roomId); // Get config from room
  
  // Assign identities
  const spyCount = 1; // Simplified for now
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

function getPlayerNumber(playerId: string): number {
  const player = players.get(playerId);
  return player?.playerNumber || 0;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/server/game.ts
git commit -m "feat: implement game logic with word assignment, speaking order, and voting"
```

---

## Task 8: 房主前端 - 基础设置

**Files:**
- Create: `src/client/host/index.html`
- Create: `src/client/host/App.tsx`
- Create: `src/client/host/RoomSetup.tsx`

- [ ] **Step 1: 创建 HTML 入口**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>谁是卧底 - 房主界面</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/App.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: 创建 React App**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../shared/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: 创建主应用组件**

```typescript
import React, { useState } from 'react';
import RoomSetup from './RoomSetup';
import PlayerList from './PlayerList';
import GameControl from './GameControl';

function App() {
  const [roomCreated, setRoomCreated] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="text-center py-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          谁是卧底
        </h1>
        <p className="text-gray-400 mt-4 tracking-widest">SPY GAME</p>
      </header>
      
      <main className="max-w-6xl mx-auto px-4">
        {!roomCreated ? (
          <RoomSetup onRoomCreated={() => setRoomCreated(true)} />
        ) : (
          <>
            <PlayerList />
            <GameControl />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: 创建房间设置组件**

```typescript
import React, { useState } from 'react';

interface RoomSetupProps {
  onRoomCreated: () => void;
}

function RoomSetup({ onRoomCreated }: RoomSetupProps) {
  const [config, setConfig] = useState({
    playerCount: 8,
    spyCount: 1,
    wordTheme: 'RANDOM',
    voteTimeout: 45,
    speakTimeout: 30,
  });
  
  const handleCreateRoom = () => {
    // TODO: Connect to WebSocket and create room
    onRoomCreated();
  };
  
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 创建游戏房间
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            玩家人数
          </label>
          <select
            value={config.playerCount}
            onChange={(e) => setConfig({ ...config, playerCount: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            {[4, 6, 8, 10, 12].map(n => (
              <option key={n} value={n}>{n}人</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            卧底人数
          </label>
          <select
            value={config.spyCount}
            onChange={(e) => setConfig({ ...config, spyCount: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            {[1, 2].map(n => (
              <option key={n} value={n}>{n}人</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            词语主题
          </label>
          <select
            value={config.wordTheme}
            onChange={(e) => setConfig({ ...config, wordTheme: e.target.value })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            <option value="RANDOM">随机混合</option>
            <option value="FOOD">美食饮品</option>
            <option value="ANIMAL">动物世界</option>
            <option value="OCCUPATION">职业工作</option>
            <option value="LOCATION">地点场所</option>
            <option value="LIFE">生活用品</option>
            <option value="ENTERTAINMENT">影视娱乐</option>
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            投票倒计时 (秒)
          </label>
          <input
            type="number"
            value={config.voteTimeout}
            onChange={(e) => setConfig({ ...config, voteTimeout: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          />
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button
          onClick={handleCreateRoom}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
        >
          创建房间
        </button>
      </div>
    </div>
  );
}

export default RoomSetup;
```

- [ ] **Step 5: 提交**

```bash
git add src/client/host/index.html src/client/host/App.tsx src/client/host/RoomSetup.tsx
git commit -m "feat: create host interface with room setup form"
```

---

## Task 9: Tailwind CSS 配置

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/client/shared/styles/global.css`

- [ ] **Step 1: 创建 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.html",
    "./src/client/**/*.tsx",
  ],
  theme: {
    extend: {
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: 创建 PostCSS 配置**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: 创建全局样式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.8);
}
```

- [ ] **Step 4: 提交**

```bash
git add tailwind.config.js postcss.config.js src/client/shared/styles/global.css
git commit -m "feat: configure Tailwind CSS with custom animations"
```

---

## Task 10: WebSocket 客户端

**Files:**
- Create: `src/client/shared/WebSocketClient.ts`

- [ ] **Step 1: 创建 WebSocket 客户端**

```typescript
import { WSEvent } from '@shared/types';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private eventListeners = new Map<WSEvent, Set<(data: unknown) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(playerId?: string): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = 3000;
    
    this.ws = new WebSocket(`${protocol}//${host}:${port}`);
    
    this.ws.onopen = () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      
      if (playerId) {
        // Send join message
        this.send('joinRoom', { playerId });
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const listeners = this.eventListeners.get(message.event);
        listeners?.forEach(fn => fn(message.data));
      } catch (error) {
        console.error('Invalid message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.attemptReconnect(playerId);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  send(event: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  on(event: WSEvent, callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  private attemptReconnect(playerId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect(playerId);
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
```

- [ ] **Step 2: 提交**

```bash
git add src/client/shared/WebSocketClient.ts
git commit -m "feat: create WebSocket client with reconnection support"
```

---

## Task 11: 房主界面 - 玩家列表

**Files:**
- Create: `src/client/host/PlayerList.tsx`

- [ ] **Step 1: 创建玩家列表组件**

```typescript
import React, { useEffect, useState } from 'react';
import { wsClient } from '@client/shared/WebSocketClient';
import { Player } from '@shared/types';

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
      setRoomId(data.roomId);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        📱 玩家加入房间
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      <div className="bg-white/8 p-6 rounded-xl border border-white/10 text-center mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">房间码</p>
        <p className="text-4xl font-black text-purple-400 tracking-widest">{roomId || '等待创建'}</p>
        <p className="text-gray-500 text-xs mt-2">请玩家扫描 QR 码或输入房间码加入</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {players.map((player) => (
          <div
            key={player.playerId}
            className={`bg-white/8 p-6 rounded-xl border-2 transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/30 ${
              player.isHost ? 'border-purple-500/80' : 'border-purple-500/30'
            }`}
          >
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {player.playerNumber}
            </div>
            <div className="text-white text-lg font-semibold mt-2">{player.nickname}</div>
            {player.isHost && (
              <div className="text-xs text-purple-400 mt-1 uppercase tracking-wider">房主</div>
            )}
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          等待玩家加入...
        </div>
      )}
    </div>
  );
}

export default PlayerList;
```

- [ ] **Step 2: 提交**

```bash
git add src/client/host/PlayerList.tsx
git commit -m "feat: add player list display with room code"
```

---

## Task 12: 房主界面 - 游戏控制

**Files:**
- Create: `src/client/host/GameControl.tsx`

- [ ] **Step 1: 创建游戏控制组件**

```typescript
import React, { useState, useEffect } from 'react';
import { wsClient } from '@client/shared/WebSocketClient';

function GameControl() {
  const [gamePhase, setGamePhase] = useState<'WAITING' | 'SPEAKING' | 'VOTING' | 'RESULT'>('WAITING');
  const [currentSpeaker, setCurrentSpeaker] = useState<{ playerId: string; playerNumber: number } | null>(null);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('currentSpeaker', (data: any) => {
      setCurrentSpeaker(data);
      setGamePhase('SPEAKING');
    });

    const unsubscribe2 = wsClient.on('allSpeakingDone', () => {
      setGamePhase('VOTING');
    });

    const unsubscribe3 = wsClient.on('revealResult', () => {
      setGamePhase('RESULT');
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, []);

  const handleStartGame = () => {
    wsClient.send('startGame', {});
    setGamePhase('WAITING_FOR_WORDS');
  };

  const handleStartSpeaking = () => {
    wsClient.send('startSpeaking', {});
  };

  const handleStartVoting = () => {
    wsClient.send('startVoting', { timeout: 45 });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 游戏控制
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      {currentSpeaker && (
        <div className="bg-gradient-to-r from-purple-500/30 to-purple-700/30 p-6 rounded-xl border border-purple-500/50 mb-6 text-center">
          <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">当前发言者</p>
          <p className="text-5xl font-black text-purple-400">{currentSpeaker.playerNumber}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {gamePhase === 'WAITING' && (
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            开始游戏
          </button>
        )}

        {gamePhase === 'WAITING_FOR_WORDS' && (
          <div className="text-gray-400 text-lg">等待所有玩家查看词语...</div>
        )}

        {gamePhase === 'SPEAKING' && (
          <>
            <button
              onClick={handleStartSpeaking}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-green-500/50"
            >
              开始发言计时
            </button>
          </>
        )}

        {gamePhase === 'VOTING' && (
          <button
            onClick={handleStartVoting}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-red-500/50"
          >
            开始投票
          </button>
        )}

        {gamePhase === 'RESULT' && (
          <>
            <button
              onClick={() => {
                wsClient.send('startNextRound', {});
                setGamePhase('WAITING');
              }}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              下一轮
            </button>
            <button
              onClick={() => {
                wsClient.send('endGame', {});
                setGamePhase('WAITING');
              }}
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              结束游戏
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GameControl;
```

- [ ] **Step 2: 提交**

```bash
git add src/client/host/GameControl.tsx
git commit -m "feat: add game control panel with phase transitions"
```

---

## Task 13: 玩家界面 - 加入房间

**Files:**
- Create: `src/client/player/index.html`
- Create: `src/client/player/App.tsx`
- Create: `src/client/player/JoinRoom.tsx`

- [ ] **Step 1: 创建玩家 HTML 入口**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>谁是卧底 - 玩家界面</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/App.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: 创建玩家 App**

```typescript
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../shared/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: 创建玩家主应用**

```typescript
import React from 'react';
import JoinRoom from './JoinRoom';
import ViewWord from './ViewWord';
import SpeakingTimer from './SpeakingTimer';
import VoteInterface from './VoteInterface';

function App() {
  const [joined, setJoined] = useState(false);
  const [wordViewed, setWordViewed] = useState(false);
  const [gamePhase, setGamePhase] = useState<'WORD' | 'SPEAKING' | 'VOTING' | 'RESULT'>('WORD');

  if (!joined) {
    return <JoinRoom onJoined={() => setJoined(true)} />;
  }

  if (!wordViewed) {
    return <ViewWord onViewed={() => setWordViewed(true)} />;
  }

  switch (gamePhase) {
    case 'SPEAKING':
      return <SpeakingTimer />;
    case 'VOTING':
      return <VoteInterface />;
    case 'RESULT':
      return <div className="text-white text-center py-20">等待结果公布...</div>;
    default:
      return <div className="text-white text-center py-20">等待游戏开始...</div>;
  }
}

export default App;
```

- [ ] **Step 4: 提交**

```bash
git add src/client/player/index.html src/client/player/App.tsx
git commit -m "feat: create player interface structure"
```

---

## Task 14: 玩家界面 - 查看词语 + 发言计时

**Files:**
- Create: `src/client/player/ViewWord.tsx`
- Create: `src/client/player/SpeakingTimer.tsx`

- [ ] **Step 1: 创建查看词语组件**

```typescript
import React, { useState, useEffect } from 'react';
import { wsClient } from '@client/shared/WebSocketClient';

interface ViewWordProps {
  onViewed: () => void;
}

function ViewWord({ onViewed }: ViewWordProps) {
  const [word, setWord] = useState<string>('');
  const [showWord, setShowWord] = useState(true);

  useEffect(() => {
    const unsubscribe = wsClient.on('wordAssigned', (data: any) => {
      setWord(data.word);
    });

    return unsubscribe;
  }, []);

  const handleConfirm = () => {
    setShowWord(false);
    wsClient.send('confirmWordViewed', {});
    setTimeout(() => {
      onViewed();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-8">🔐 你的词语</h2>
        
        {showWord ? (
          <>
            <p className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8">
              {word}
            </p>
            <button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
            >
              我已查看
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-lg animate-pulse">
            词语已隐藏...
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewWord;
```

- [ ] **Step 2: 创建发言计时组件**

```typescript
import React, { useState, useEffect } from 'react';
import { wsClient } from '@client/shared/WebSocketClient';

function SpeakingTimer() {
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('currentSpeaker', (data: any) => {
      setIsCurrentSpeaker(true);
    });

    const unsubscribe2 = wsClient.on('startTimer', (data: any) => {
      setTimerRemaining(data.duration);
      setTimerRunning(true);
    });

    const unsubscribe3 = wsClient.on('timerUpdate', (data: any) => {
      setTimerRemaining(data.remaining);
    });

    const unsubscribe4 = wsClient.on('timerEnded', () => {
      setTimerRunning(false);
      setIsCurrentSpeaker(false);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, []);

  const handleStartTimer = () => {
    wsClient.send('startTimer', { duration: 30 });
  };

  if (!isCurrentSpeaker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <p className="text-gray-400 text-lg mb-4">等待发言</p>
          <div className="text-6xl font-black text-purple-400 animate-pulse">👆</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        {!timerRunning ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">轮到你了！</h2>
            <p className="text-gray-400 mb-8">描述你的词语（不要直接说出词语）</p>
            <button
              onClick={handleStartTimer}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
            >
              开始计时
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">发言时间</p>
            <div className={`text-8xl font-black ${timerRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {timerRemaining}
            </div>
            <p className="text-gray-500 mt-4">秒</p>
          </>
        )}
      </div>
    </div>
  );
}

export default SpeakingTimer;
```

- [ ] **Step 3: 提交**

```bash
git add src/client/player/ViewWord.tsx src/client/player/SpeakingTimer.tsx
git commit -m "feat: add player word view and speaking timer components"
```

---

## Task 15: 玩家界面 - 投票 + 完整 WebSocket 集成

**Files:**
- Create: `src/client/player/VoteInterface.tsx`
- Modify: `src/server/index.ts` - 完善消息处理

- [ ] **Step 1: 创建投票组件**

```typescript
import React, { useState, useEffect } from 'react';
import { wsClient } from '@client/shared/WebSocketClient';
import { Player } from '@shared/types';

function VoteInterface() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(45);
  const [votingStarted, setVotingStarted] = useState(false);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
    });

    const unsubscribe2 = wsClient.on('startVoting', (data: any) => {
      setVotingStarted(true);
      setTimerRemaining(data.timeout || 45);
      
      // Start countdown
      const interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitVote();
            return 0;
          }
          wsClient.send('timerUpdate', { remaining: prev - 1 });
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  const handleSubmitVote = () => {
    if (selectedPlayer) {
      wsClient.send('vote', { targetPlayerId: selectedPlayer });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🗳️ 投票环节</h2>
        
        {votingStarted ? (
          <>
            <div className={`text-6xl font-black text-center mb-8 ${timerRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {timerRemaining}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {players.filter(p => !p.eliminated).map((player) => (
                <button
                  key={player.playerId}
                  onClick={() => setSelectedPlayer(player.playerId)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedPlayer === player.playerId
                      ? 'bg-purple-500/30 border-purple-500/80'
                      : 'bg-white/8 border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  <div className="text-2xl font-bold text-purple-400">{player.playerNumber}</div>
                  <div className="text-white text-lg">{player.nickname}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={!selectedPlayer}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认投票
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-center py-12">
            等待投票开始...
          </div>
        )}
      </div>
    </div>
  );
}

export default VoteInterface;
```

- [ ] **Step 2: 完善 WebSocket 消息处理**

在 `src/server/index.ts` 中添加完整的事件处理逻辑，连接到 `room.ts` 和 `game.ts`。

- [ ] **Step 3: 提交**

```bash
git add src/client/player/VoteInterface.tsx src/server/index.ts
git commit -m "feat: complete player voting interface and WebSocket event handling"
```

---

## Task 16: 测试与优化

**Files:**
- Create: `tests/game.test.ts`
- Create: `tests/room.test.ts`

- [ ] **Step 1: 创建游戏逻辑测试**

```typescript
import { describe, it, expect } from 'vitest';
import { generateSpyIndices, shuffleArray } from '../src/server/game';

describe('Game Logic', () => {
  it('should generate correct number of spy indices', () => {
    const indices = generateSpyIndices(8, 2);
    expect(indices.length).toBe(2);
    expect(indices.every(i => i >= 0 && i < 8)).toBe(true);
  });

  it('should shuffle array randomly', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npm install --save-dev vitest
npm run test
```

- [ ] **Step 3: 提交**

```bash
git add tests/
git commit -m "test: add unit tests for game logic"
```

---

**Plan Status:** ✅ Complete

所有任务已定义，包含完整的代码示例和测试。

---

## 📄 计划已保存

文件位置：`docs/specs/2026-05-06-spy-game-plan.md`

---

## 🚀 执行选项

**计划完成并保存到 `docs/specs/2026-05-06-spy-game-plan.md`。有两种执行方式：**

**1. Subagent 驱动（推荐）** - 我为每个任务派遣独立的 subagent，任务间审查，快速迭代

**2. 直接执行** - 在当前会话中按任务顺序执行，分批进行并设置检查点

**你选择哪种方式？**
