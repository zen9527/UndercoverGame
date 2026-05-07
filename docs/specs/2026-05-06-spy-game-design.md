# 谁是卧底 - 局域网派对游戏设计文档

**日期**: 2026-05-06  
**版本**: 1.0  
**状态**: 待审查

---

## 📖 项目概述

### 核心概念
一款局域网多人派对游戏，类似"谁是卧底"。玩家通过线下口头交流推理出卧底身份，线上工具提供计时、投票和状态同步功能。

### 目标用户
- 6-12 人的中型聚会
- 线下派对、朋友聚餐、团队建设
- 不需要额外主持人，程序自动运行

### 成功标准
- 玩家能在 5 分钟内完成房间创建并开始游戏
- 所有设备实时同步（延迟 < 500ms）
- 身份全程保密，无作弊可能
- 离线局域网环境完全可用

---

## 🏗️ 架构设计

### 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| **前端** | React + TypeScript | 组件化、类型安全、移动端适配 |
| **后端** | Node.js + WebSocket | 实时通信、低延迟 |
| **UI 框架** | Tailwind CSS | 快速样式、深色主题支持 |
| **状态管理** | Zustand | 轻量级、适合游戏状态 |
| **部署** | 本地服务器 | 局域网环境、无需外部依赖 |

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    房主电脑 (Host)                       │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │ React 管理界面 │    │   WebSocket 服务器 (端口 3000)   │   │
│  └──────┬───────┘    └──────────────┬───────────────┘   │
│         │                           │                    │
│         │ 房间配置 + 游戏控制        │ 实时状态同步       │
└─────────┼───────────────────────────┼────────────────────┘
          │                           │
          │ WiFi 局域网                │ WiFi 局域网
          │                           │
┌─────────┼───────────────────────────┼────────────────────┐
│         ▼                           ▼                    │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ 玩家手机 1    │    │ 玩家手机 2    │   ... 玩家手机 N   │
│  │ React 移动端  │    │ React 移动端  │                   │
│  └──────────────┘    └──────────────┘                   │
│         │                           │                    │
│         └───────────┬───────────────┘                    │
│                     │                                    │
│              WebSocket 连接                              │
└─────────────────────┴────────────────────────────────────┘
```

---

## 🎮 游戏流程设计

### 阶段 1: 房间创建
**触发**: 房主首次访问  
**动作**:
- 房主设置游戏参数（玩家人数、卧底数量、词语主题、投票时间）
- 系统生成房间二维码 + 房间码
- 房主自动加入房间（作为玩家 1）

**数据流**:
```
房主界面 → POST /api/room/create → 生成 roomId + 配置 → WebSocket 广播
```

### 阶段 2: 玩家加入
**触发**: 玩家扫码或输入房间码  
**动作**:
- 玩家输入昵称
- 系统分配玩家编号（按加入顺序）
- 房主界面显示新玩家加入

**数据流**:
```
玩家手机 → POST /api/room/join → 分配 playerId → WebSocket 广播玩家列表
```

### 阶段 3: 身份分配
**触发**: 房主点击"开始游戏"  
**动作**:
- 系统随机分配词语（平民词 + 卧底词）
- 系统随机分配身份（1-2 个卧底）
- 每个玩家手机端显示自己的词语（一次性查看）
- 查看后自动隐藏，防止偷看

**数据流**:
```
房主 → WS: startGame → 服务器分配身份 → 单独推送给每个玩家 → 玩家确认查看
```

### 阶段 4: 发言环节
**触发**: 房主点击"开始描述环节"  
**动作**:
- 系统随机决定发言顺序
- 当前发言玩家手机端显示"开始发言计时"按钮
- 玩家点击按钮 → 所有设备同步开始倒计时（30 秒）
- 倒计时结束 → 自动切换到下一个玩家

**数据流**:
```
房主 → WS: startSpeaking → 生成顺序 → 通知当前发言者
当前发言者 → WS: startTimer(30) → 广播倒计时 → 所有设备同步
倒计时结束 → WS: nextSpeaker → 切换到下一玩家
```

### 阶段 5: 投票环节
**触发**: 所有玩家发言完成  
**动作**:
- 房主点击"开始投票"
- 所有玩家手机端显示投票界面（不能看到他人选择）
- 玩家私下选择怀疑对象
- 倒计时结束自动收集投票

**数据流**:
```
房主 → WS: startVoting(45) → 广播投票开始
玩家 → WS: vote(targetPlayerId) → 服务器收集（不广播）
倒计时结束 → WS: tallyVotes → 计算结果
```

### 阶段 6: 结果公布
**触发**: 投票完成  
**动作**:
- 房主点击"公布结果"
- 显示被淘汰玩家 + 票数分布
- 揭示平民词语 vs 卧底词语
- 判断获胜方（卧底被找出 = 平民胜；卧底存活 = 继续下一轮）

**数据流**:
```
房主 → WS: revealResult → 广播词语 + 身份 + 获胜方
```

### 阶段 7: 下一轮/结束
**触发**: 房主选择  
**动作**:
- 下一轮：重新分配身份和词语，保留玩家列表
- 结束游戏：清空房间，生成新二维码

---

## 🔐 安全设计

### 身份隐私保护

| 角色 | 可见信息 | 不可见信息 |
|------|---------|-----------|
| **房主** | 玩家列表、游戏进度、投票统计 | 所有玩家身份（包括自己） |
| **普通玩家** | 自己的词语、发言进度 | 他人身份、他人投票选择 |
| **系统** | 全部信息（内部记录） | - |

### 防作弊机制

1. **词语查看一次性**: 手机端显示词语后自动隐藏，无法再次查看
2. **投票匿名**: 服务器收集投票但不广播谁投给谁
3. **身份加密**: 身份分配只在服务器内存中，不存储到数据库
4. **房主权限限制**: 房主无法查看任何玩家身份（包括自己）

### 房主转移

**触发条件**: 
- 房主断开 WebSocket 连接
- 房主主动转让房主权限

**处理流程**:
```
房主断开 → 服务器检测心跳丢失 → 选择下一个玩家作为新房主 → 广播房主变更
```

---

## 📱 移动端设计

### 页面结构

| 页面 | 功能 | 可见角色 |
|------|------|---------|
| **加入房间** | 输入昵称、扫码加入 | 所有玩家 |
| **查看词语** | 显示自己的词语（一次性） | 所有玩家 |
| **发言等待** | 显示"等待发言" + 当前发言者 | 所有玩家 |
| **发言计时** | "开始计时"按钮 + 倒计时 | 当前发言者 |
| **投票界面** | 选择怀疑对象 + 倒计时 | 所有玩家 |
| **结果查看** | 显示本轮结果 | 所有玩家 |

### 响应式设计

- **横屏优先**: 更适合聚会场景
- **大按钮**: 方便快速操作
- **高对比度**: 深色背景 + 亮色文字
- **自动旋转**: 支持横竖屏切换

---

## 🗄️ 数据模型

### Room (房间)
```typescript
interface Room {
  roomId: string;           // 唯一房间 ID
  hostId: string;           // 当前房主 playerId
  config: GameConfig;       // 游戏配置
  status: RoomStatus;       // 房间状态
  createdAt: Date;
}

interface GameConfig {
  playerCount: number;      // 目标玩家人数 (6-12)
  spyCount: number;         // 卧底数量 (1-2)
  wordTheme: WordTheme;     // 词语主题
  voteTimeout: number;      // 投票倒计时 (秒)
  speakTimeout: number;     // 发言倒计时 (秒)
}

type RoomStatus = 'CREATED' | 'WAITING' | 'PLAYING' | 'ENDED';
```

### Player (玩家)
```typescript
interface Player {
  playerId: string;         // 唯一玩家 ID
  roomId: string;           // 所属房间
  nickname: string;         // 昵称
  playerNumber: number;     // 编号 (1-N)
  isHost: boolean;          // 是否为房主
  status: PlayerStatus;     // 玩家状态
  word?: string;            // 分配的词语（仅自己可见）
  identity?: Identity;      // 身份（仅系统可见）
}

type PlayerStatus = 'JOINED' | 'READY' | 'SPEAKING' | 'VOTED' | 'ELIMINATED';
type Identity = 'CIVILIAN' | 'SPY';
```

### GameRound (游戏轮次)
```typescript
interface GameRound {
  roundNumber: number;      // 轮次编号
  roomId: string;
  speakingOrder: string[];  // 发言顺序（playerId 列表）
  votes: VoteRecord[];      // 投票记录（仅系统可见）
  eliminatedPlayer?: string; // 被淘汰玩家
  civilianWord: string;     // 平民词语
  spyWord: string;          // 卧底词语
  winner?: 'CIVILIAN' | 'SPY'; // 获胜方
}

interface VoteRecord {
  voterId: string;          // 投票者
  targetId: string;         // 被投票者
  timestamp: Date;
}
```

---

## 🔌 API 设计

### REST API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/room/create` | 创建房间 |
| POST | `/api/room/join` | 加入房间 |
| GET | `/api/room/:roomId` | 获取房间状态 |
| POST | `/api/room/:roomId/start` | 开始游戏 |
| POST | `/api/room/:roomId/leave` | 离开房间 |

### WebSocket 事件

| 方向 | 事件 | 数据 | 功能 |
|------|------|------|------|
| C→S | `joinRoom` | `{ roomId, nickname }` | 加入房间 |
| S→C | `roomJoined` | `{ playerId, playerNumber, isHost }` | 确认加入 |
| C→S | `startGame` | `{ roomId }` | 房主开始游戏 |
| S→C | `wordAssigned` | `{ word }` | 分配词语（单独推送） |
| C→S | `confirmWordViewed` | `{ playerId }` | 确认已查看词语 |
| C→S | `startSpeaking` | `{ roomId }` | 房主开始发言环节 |
| S→C | `currentSpeaker` | `{ playerId, playerNumber }` | 通知当前发言者 |
| C→S | `startTimer` | `{ duration }` | 当前发言者启动计时 |
| S→C | `timerUpdate` | `{ remainingSeconds }` | 同步倒计时 |
| C→S | `vote` | `{ targetPlayerId }` | 提交投票 |
| S→C | `revealResult` | `{ eliminated, words, winner }` | 公布结果 |
| S→C | `hostTransferred` | `{ newHostId }` | 房主转移通知 |

---

## ⚠️ 错误处理

### 常见错误场景

| 场景 | 处理方式 |
|------|---------|
| **玩家断线** | 标记为"离线"，允许重新连接恢复 |
| **房主断线** | 自动转移房主给下一个在线玩家 |
| **投票超时** | 自动收集已投的票，未投的视为弃权 |
| **词语库为空** | 使用默认词语库（美食、动物、职业等） |
| **网络延迟** | WebSocket 心跳检测，超过 30 秒断开 |
| **房间过期** | 30 分钟无活动自动清理房间 |

### 错误代码

```typescript
enum ErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  INVALID_CONFIG = 'INVALID_CONFIG',
  NOT_HOST = 'NOT_HOST',
  ALREADY_VOTED = 'ALREADY_VOTED',
  TIMER_ALREADY_STARTED = 'TIMER_ALREADY_STARTED',
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',
}
```

---

## 🧪 测试策略

### 单元测试
- 词语分配算法（确保卧底数量正确）
- 发言顺序随机化
- 投票统计逻辑
- 获胜方判断逻辑

### 集成测试
- WebSocket 连接和断开
- 房主转移流程
- 多设备同步延迟测试

### E2E 测试
- 完整游戏流程（创建 → 加入 → 发言 → 投票 → 结果）
- 断线重连场景
- 房主中途离开场景

---

## 📦 文件结构

```
谁是卧底/
├── src/
│   ├── server/
│   │   ├── index.ts              # WebSocket 服务器入口
│   │   ├── room.ts               # 房间管理
│   │   ├── game.ts               # 游戏逻辑
│   │   ├── wordPool.ts           # 词语库
│   │   └── types.ts              # 共享类型
│   ├── client/
│   │   ├── host/                 # 房主界面
│   │   │   ├── App.tsx
│   │   │   ├── RoomSetup.tsx
│   │   │   ├── PlayerList.tsx
│   │   │   ├── GameControl.tsx
│   │   │   └── ResultDisplay.tsx
│   │   ├── player/               # 玩家界面
│   │   │   ├── App.tsx
│   │   │   ├── JoinRoom.tsx
│   │   │   ├── ViewWord.tsx
│   │   │   ├── SpeakingTimer.tsx
│   │   │   └── VoteInterface.tsx
│   │   ├── shared/               # 共享组件
│   │   │   ├── Countdown.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   └── WebSocketClient.ts
│   │   └── styles/
│   │       └── global.css        # Tailwind + 深色主题
│   └── shared/
│       └── schemas.ts            # Zod 共享 schema
├── docs/
│   └── specs/
│       └── 2026-05-06-spy-game-design.md
├── package.json
└── tsconfig.json
```

---

## 🚀 开发计划

### Phase 1: 核心基础设施 (1-2 天)
- WebSocket 服务器搭建
- 房间管理逻辑
- 基础类型定义

### Phase 2: 房主界面 (2-3 天)
- 房间设置页面
- 玩家列表显示
- 游戏控制按钮

### Phase 3: 玩家界面 (2-3 天)
- 加入房间页面
- 词语查看页面
- 发言计时页面
- 投票页面

### Phase 4: 游戏逻辑 (1-2 天)
- 身份分配算法
- 发言顺序管理
- 投票统计
- 获胜方判断

### Phase 5: 测试和优化 (1-2 天)
- E2E 测试
- 性能优化
- UI 美化

---

## ✅ 待审查项

请用户确认以下内容：
1. 游戏流程是否符合预期
2. 房主权限设计是否合理
3. 安全设计是否足够防止作弊
4. 技术栈选择是否合适
5. 文件结构是否清晰

如有修改建议，请在审查后反馈。
