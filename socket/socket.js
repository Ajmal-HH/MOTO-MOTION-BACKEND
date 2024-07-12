import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

let users = [];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {  
    origin: ["https://moto-motion-frontend.vercel.app","https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app"],
    methods: ["GET", "POST"],
  },
});


  const emailToSocketIdMap = new Map();
  const socketidToEmailMap = new Map();

  io.on("connection", (socket) => {
    console.log("connection");
    
    console.log("USER CONNECTED", socket?.id);
    socket.on("addUser", (userId) => {
      console.log(userId,"userId");
      const isUserExist = users.find((user) => user.userId === userId);    
 
      if (!isUserExist) {
        const user = { userId, socketId: socket.id };
        users.push(user);
        console.log(users,">>>>>>>>")
        io.emit("getUsers", users);
      }
    });


    socket.on(
      "sendMessage",
      async ({
        senderId,
        receiverId,
        message,
      }) => {
        const receiver = users.find((user) => user.userId === receiverId);
        const sender = users.find((user) => user.userId === senderId);
        console.log("sender :>> ", sender);
        console.log("receiver :>> ", receiver);
        console.log("socket users :", users);
        console.log(receiverId,"reciever id found11");

        if (receiver) {
         
          io.to(receiver?.socketId)
           .to(sender?.socketId)
           .emit("getMessage", {
              senderId,
              message,
              // conversationId,
              receiverId,
              // socketType,
              // lastUpdate,
            });
        } else {
          console.log(sender,"sender found");
          console.log(receiverId,"reciever id found");
          io.to(sender?.socketId)?.emit("getMessage", {
            senderId,
            message,
            // conversationId,
            receiverId,
            // socketType,
            // lastUpdate,
          });
        }
      }
    );
  })



  export { app, io, server };



