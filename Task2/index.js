
const Redisclient = require("./Config/redis");
const express = require('express');
const app = require('./app');
const http = require('http');
const dbConnection = require('./Config/dbconfig');
require('dotenv').config();
const errormiddleware = require('./middlewares/errorMiddleware');
app.use(express.json());
const router = require('./Routes/userRoute');
//const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cookie = require("cookie")
const {sendMessage} = require('./Controllers/chatController');
//app.use(helmet());
const {Server} = require('socket.io');

const jwt = require('jsonwebtoken');
const {RabitConnection}= require('./Core_App_Connectivities/Rabitmq');
const message = require("./Models/messageModel");
 RabitConnection();
require('./Services/munshi.servic');
require('./Services/event_router.service');
require('./event/eventHandler');

app.use(cookieParser());

app.use(express.urlencoded({extended:true}));
app.use('/api/user', router);
app.use(errormiddleware);
app.use(express.static('public'));



dbConnection();

    const server = http.createServer(app);
    const io = new Server(server);
     
   io.use((socket, next) => {
    try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.usertoken;

        if (!token) return next(new Error("Authentication error"));

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        socket.userId = decoded.userId;  

        next();
    } catch (err) {
        next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    console.log("User connected");
 

 socket.on("join-room", async (room) => {
    socket.join(room);
    console.log("User joined room:", room);

    const oldMessages = await message.find({ room }).sort({ createdAt: 1 });

    socket.emit("chat-history", oldMessages);
});
  
    socket.on("send-message", (data)=>sendMessage(data, io));


    socket.on('leave-room', (room)=>{
        socket.leave(room)
        console.log('room left', room);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
let PORT = process.env.PORT ||3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

(async () => {
    try {
        await RabitConnection();
        console.log("RabbitMQ connected successfully");
    } catch (error) {
        console.error(" RabbitMQ connection failed:", error);
    }

   
})();



