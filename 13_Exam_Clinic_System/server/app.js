import 'dotenv/config';

import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);


// ---------- RATE LIMITING ----------
import { rateLimit } from 'express-rate-limit';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56
});

app.use(generalLimiter);
app.use('/auth', authLimiter);


// ---------- CORS ----------
import cors from 'cors';

app.use(cors({
  origin: process.env.SVELTE_URL,
  credentials: true
}));


// ---------- SECURITY ----------
import helmet from 'helmet';

app.use(helmet());

// Logging
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';

app.use(morgan('combined'))

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});


// ---------- SESSION ----------
import session from 'express-session';

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
});

app.use(sessionMiddleware);


// ---------- SOCKET.IO ----------
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.SVELTE_URL,
    credentials: true
  }
});

io.engine.use(sessionMiddleware);

/*io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('coordinator-assigns-room', (data) => {
    //console.log(data);
    socket.broadcast.emit('room-assignment', data);  
  });
  socket.on('nurse-patient-confirm', () => {
    //console.log(data);
    socket.broadcast.emit('patient-confirm');  
  });
   socket.on('nurse-patient-blood-sample-change', () => {
    //console.log(data);
    socket.broadcast.emit('patient-blood-sample-change');  
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
}); */

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Coordinator assigns patient to room
  socket.on('coordinator-assigns-room', (data) => {
    console.log('Room assignment:', data);
    // Notify the specific room
    if (data.roomId) {
      io.to(`room-${data.roomId}`).emit('room-assignment', data);
    }
    // Also broadcast to all coordinators and nurses
    socket.broadcast.emit('room-assignment', data);
  });

  // Nurse confirms patient
  socket.on('nurse-patient-confirm', (data) => {
    console.log('Patient confirmed:', data);
    socket.broadcast.emit('patient-confirm', data);
  });

  // Blood sample status change
  socket.on('nurse-patient-blood-sample-change', (data) => {
    console.log('Blood sample status changed:', data);
    socket.broadcast.emit('patient-blood-sample-change', data);
  });

  // Patient activity update
  socket.on('patient-activity', (userId) => {
    console.log('Patient activity:', userId);
    socket.broadcast.emit('patient-activity-update', { userId });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});


// ---------- BODY PARSING ----------
app.use(express.json());


// ---------- ROUTERS ----------
import authRouter from './routers/authRouter.js';
app.use(authRouter);

import clinicRouter from './routers/clinicRouter.js';
app.use(clinicRouter);


// ---------- 404 HANDLER ----------
app.get('/{*splat}', (req, res) => {
  res.send(`
    <div>
      <h1>404</h1>
      <h3>Page - ${req.path} - doesn't exist</h3>
    </div>
  `);
});

app.all('/{*splat}', (req, res) => {
  res.send({
    errorMessage: `The route for ${req.path} and ${req.method} does not exist`
  });
});


// ---------- SERVER START ----------
const PORT = process.env.PORT ?? 8080;

server.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});