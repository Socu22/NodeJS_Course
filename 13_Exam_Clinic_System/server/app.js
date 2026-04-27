import 'dotenv/config';

import express from 'express';

const app = express();

import { rateLimit } from 'express-rate-limit';

// ---------- GENERAL LIMITER ----------
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});
app.use(generalLimiter);
// ---------- AUTH LIMITER ----------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});
app.use('/auth', authLimiter);

import cors from 'cors';

app.use(cors({
    origin: process.env.SVELTE_URL,
    credentials: true
}));


// ---------- SECURITY ----------
import helmet from 'helmet';
app.use(helmet());

import session from 'express-session';
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, 

  }
}));


// Handles json-Body
app.use(express.json());

// ---------- ROUTERS ----------
import authRouter from './routers/authRouter.js';
app.use(authRouter);

// ---------- 404 ----------
app.get('/{*splat}', (req, res) => {
	res.send(`<div>
		<h1>404</h1>
		<h3>Page - ${req.path} - doesn't exist</h3>
	</div>`);
});
app.all('/{*splat}', (req, res)  => {
	res.send({ errorMessage: `The route for ${req.path} and ${req.method} does not exist` });
});


const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
    console.log("Server is running port", PORT);
});