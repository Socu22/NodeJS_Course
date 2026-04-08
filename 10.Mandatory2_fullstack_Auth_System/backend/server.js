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

// ---------- CORS ----------
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  credentials: true, // Allow credentials (cookies, sessions)
}));


// ---------- SECURITY ----------
import helmet from 'helmet';
app.use(helmet());

import session from 'express-session';


// Session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a real secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      sameSite: 'lax', // or 'strict' for stricter security
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(express.json());

// ---------- ROUTERS ----------
import middlewareRouter from './public/routers/middlewareRouter.js';
app.use(middlewareRouter);

import authRouter from './public/routers/authRouter.js';
app.use(authRouter);

import sessionRouter from './public/routers/sessionRouter.js';
app.use(sessionRouter);


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
	console.log("Server is running on port", PORT);
});