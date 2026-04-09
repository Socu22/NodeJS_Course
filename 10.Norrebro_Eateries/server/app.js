import 'dotenv/config';

import express from 'express';

const app = express();


import cors from 'cors';

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

/* app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
 */
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

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    console.log("Server is running port", PORT);
});