import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { IGlobalState, DEFAULT_AGENTS } from '../../shared/types.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

// Initial state
const state: IGlobalState = {
  agents: DEFAULT_AGENTS.map(a => ({ ...a, lastActive: Date.now() })),
  tasks: [],
  balance: 10000,
  totalSpent: 0,
  activities: [],
  timestamp: Date.now(),
};

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send current state on connect
  socket.emit('state:update', state);

  socket.on('agent:interact', (agentId: string, action: string) => {
    console.log(`Agent ${agentId} action: ${action}`);
  });

  socket.on('task:create', (task) => {
    console.log(`Task created: ${task.title}`);
  });

  socket.on('task:assign', (taskId: string, agentId: string) => {
    console.log(`Task ${taskId} assigned to ${agentId}`);
  });

  socket.on('task:update:status', (taskId: string, status: string) => {
    console.log(`Task ${taskId} status: ${status}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});
