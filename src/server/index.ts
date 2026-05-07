import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { generatePlayerId } from './utils';
import { createRoom, addPlayer, broadcastToRoom, setClientWs, getClientWs, getPlayersInRoom, getRoom } from './room';
import { startGame, confirmWordViewed, startSpeaking, startTimer, nextSpeaker, submitVote, tallyVotes } from './game';

const PORT = 3000;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients
const clients = new Map<string, WebSocket>(); // playerId -> ws

wss.on('connection', (ws) => {
  const playerId = generatePlayerId();
  setClientWs(playerId, ws);
  
  console.log('New client connected:', playerId);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message.event);
      
      // Handle WebSocket events
      switch (message.event) {
        case 'joinRoom':
          // TODO: Implement room join logic
          break;
        case 'startGame':
          startGame(message.data.roomId);
          break;
        case 'confirmWordViewed':
          confirmWordViewed(message.data.roomId, playerId);
          break;
        case 'startSpeaking':
          startSpeaking(message.data.roomId);
          break;
        case 'startTimer':
          startTimer(message.data.roomId, message.data.duration);
          break;
        case 'vote':
          submitVote(message.data.roomId, playerId, message.data.targetPlayerId);
          break;
        default:
          console.log('Unknown event:', message.event);
      }
    } catch (error) {
      console.error('Invalid message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected:', playerId);
    clients.delete(playerId);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on http://0.0.0.0:${PORT}`);
  console.log(`Host interface: http://localhost:${PORT}/host`);
  console.log(`Player interface: http://localhost:${PORT}/player`);
});
