// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();

// let users = [];

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {  
//     origin: ["https://moto-motion-frontend.vercel.app","https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app"],
//     methods: ["GET", "POST"],
//   },
// });


//   const emailToSocketIdMap = new Map();
//   const socketidToEmailMap = new Map();

//   io.on("connection", (socket) => {
//     console.log("connection");
    
//     console.log("USER CONNECTED", socket?.id);
//     socket.on("addUser", (userId) => {
//       console.log(userId,"userId");
//       const isUserExist = users.find((user) => user.userId === userId);    
 
//       if (!isUserExist) {
//         const user = { userId, socketId: socket.id };
//         users.push(user);
//         console.log(users,">>>>>>>>")
//         io.emit("getUsers", users);
//       }
//     });


//     socket.on(
//       "sendMessage",
//       async ({
//         senderId,
//         receiverId,
//         message,
//       }) => {
//         const receiver = users.find((user) => user.userId === receiverId);
//         const sender = users.find((user) => user.userId === senderId);
//         console.log("sender :>> ", sender);
//         console.log("receiver :>> ", receiver);
//         console.log("socket users :", users);
//         console.log(receiverId,"reciever id found11");

//         if (receiver) {
         
//           io.to(receiver?.socketId)
//            .to(sender?.socketId)
//            .emit("getMessage", {
//               senderId,
//               message,
//               // conversationId,
//               receiverId,
//               // socketType,
//               // lastUpdate,
//             });
//         } else {
//           console.log(sender,"sender found");
//           console.log(receiverId,"reciever id found");
//           io.to(sender?.socketId)?.emit("getMessage", {
//             senderId,
//             message,
//             // conversationId,
//             receiverId,
//             // socketType,
//             // lastUpdate,
//           });
//         }
//       }
//     );
//   })



//   export { app, io, server };


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

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  // Add user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Send and receive messages
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiver = getUser(receiverId);
    const sender = getUser(senderId);
    console.log("sender :>> ", sender);
    console.log("receiver :>> ", receiver);
    console.log("socket users :", users);

    if (receiver) {
      io.to(receiver.socketId).to(sender.socketId).emit("getMessage", {
        senderId,
        message,
        receiverId,
      });
    } else {
      io.to(sender.socketId).emit("getMessage", {
        senderId,
        message,
        receiverId,
      });
    }
  });

  // Remove user on disconnect
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

export { app, io, server };




