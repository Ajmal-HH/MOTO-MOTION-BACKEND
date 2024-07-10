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






// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST"],
//   },
// });

// const userSocketMap = {}; // {userId: socketId}

// export const getReceiverSocketId = (receiverId) => {
// 	console.log(receiverId, "receiverId....");
// 	console.log(userSocketMap, "Complete userSocketMap....");
// 	console.log(userSocketMap[receiverId], "userSocketMap[receiverId]....");
//   return userSocketMap[receiverId];
// };         

// io.on("connection", (socket) => {
// 	console.log("a user connected", socket.id);
  
// 	const userId = socket.handshake.query.userId;
// 	console.log(userId, "userId during connection");
// 	if (userId && userId !== "undefined") {
// 	  userSocketMap[userId] = socket.id;
// 	  console.log(`User ${userId} connected with socket ID: ${socket.id}`);
// 	  console.log("Current userSocketMap: ", userSocketMap);
// 	}
  
// 	socket.on("disconnect", () => {
// 	  console.log("user disconnected", socket.id);
// 	  delete userSocketMap[userId];
// 	  console.log(`User ${userId} disconnected`);
// 	  console.log("Current userSocketMap: ", userSocketMap);
// 	  io.emit("getOnlineUsers", Object.keys(userSocketMap));
// 	});
//   });
  

// export { app, io, server };
