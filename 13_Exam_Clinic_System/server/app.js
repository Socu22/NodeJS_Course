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


// ---------- SESSION ----------
import session from 'express-session';

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
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

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('assign-room', (data) => {
    io.emit('room-updated', data);
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