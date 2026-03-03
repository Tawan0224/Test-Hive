import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSessionHandlers } from './sessionHandlers.js';

export function initSocketServer(httpServer) {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // JWT auth middleware — mirrors server/src/middleware/auth.js
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('NOT_AUTHENTICATED'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('USER_NOT_FOUND'));

      socket.user = user;
      next();
    } catch {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    registerSessionHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user.username} (${socket.id})`);
    });
  });

  console.log('[Socket] Socket.IO server initialized');
  return io;
}
