import express from 'express';

const app = express();


import { rateLimit } from 'express-rate-limit';
//--------------MIdleware at the top -------------

const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes). 429 status code if overflow of request specified 
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
});

app.use(generalLimiter);


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});

app.use('/auth', authLimiter);

import helmet from 'helmet';
app.use(helmet());// contains (req res next)


import session from 'express-session';

app.use(session({
    secret: 'keyboard cat', // todo make sure not to push this
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


// ------then routes---------

import middlewareRouter from './routers/middlewareRouter.js';
app.use(middlewareRouter);

import authRouter from './routers/authRouter.js';
app.use(authRouter);

import sessionRouter from './routers/sessionRouter.js';
app.use(sessionRouter);


// /{*splat} is the new syntax in Express 5.x, before it was just /*
app.get('/{*splat}', (req, res) => {
    res.send(`<div>
                <h1>404</h1>
                <h3>Page - ${req.path} - doesn't exist</h3>
            </div>`
    );
});

app.all('/{*splat}', (req, res)  => {
    res.send({ errorMessage: `The route for ${req.path} and the HTTP method ${req.method} does not exist` });
});
//console.log(""||"got here");
//console.log(null||"got here"); // happens on   nullish Coalescence 
//console.log(undefined||"got here"); // happens on   nullish Coalescence 
// nullish Coalescence operator ??
// Nullish coaelescing operator ??
const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
