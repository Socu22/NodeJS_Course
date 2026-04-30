import express from 'express' // convience function of http
const app = express(); // Express and socket server runs in same port as one

app.use(express.static('public'))

import http from 'http';
const server = http.createServer(app);

import {Server} from 'socket.io'; // http://localhost:8080/socket.io/socket.io.js // transpiled code using for example babel 
const io = new Server(server);

io.on("connection", (socket)=> { // when a socket is connected
    console.log("A new socket connected with id", socket.id);

    socket.on("client-sends-color", (data)=> {
        console.log(data);
        socket.emit("server-sends-color", data);
        
    } )


    socket.on("disconnect", () => {
        console.log("A socket disconnected",socket.id);
        
    })

});

const PORT = process.env.PORT ?? 8080;

server.listen(PORT, () => console.log("Server is running on port",PORT))