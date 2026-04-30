import 'dotenv/config';

import express from 'express' // convience function of http
const app = express(); // Express and socket server runs in same port as one


import http from 'http';
const server = http.createServer(app);

import {Server} from 'socket.io'; // http://localhost:8080/socket.io/socket.io.js // transpiled code using for example babel 
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});


app.use(express.json());

import cors from 'cors'

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

import session from 'express-session';
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,  // require('crypto').randomBytes(27).toString('hex')
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
});
io.engine.use(sessionMiddleware)


app.use(sessionMiddleware); 

import nicknamesRouter from './routers/nicknamesRouter.js'
import { log } from 'console';
app.use(nicknamesRouter)

io.on("connection", (socket)=> { // when a socket is connected
    console.log("A new socket connected with id", socket.id);

    socket.on("client-sends-color", (data)=> {
        console.log(data);

        const session = socket.request.session;

        session.timesSubmitted = session.timesSubmitted +1 ||1 
        //console.log(session);
        

        socket.emit("server-sends-color", data);
        session.save();
        
    } );


    socket.on("disconnect", () => {
        console.log("A socket disconnected",socket.id);
        
    })

});

const PORT = process.env.PORT ?? 8080;

server.listen(PORT, () => console.log("Server is running on port",PORT))