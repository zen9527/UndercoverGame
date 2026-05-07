import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = 3000;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

// Store connected clients (will be used in room.ts)
// @ts-ignore - intentionally unused for now
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
