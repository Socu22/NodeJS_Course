import 'dotenv/config';

import express from 'express';

const app = express();

import path from 'path';
app.use(express.static('../client/dist'));


import session from 'express-session';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

import restaurantsRouter from './routers/restaurantsRouter.js';
app.use(restaurantsRouter);
import visitorsRouter from './routers/visitorsRouter.js';
app.use(visitorsRouter);


app.get('/{*splat}', (req, res) => {
    res.sendFile(path.resolve('../client/dist/index.html'));
});

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    console.log("Server is running port", PORT);
});