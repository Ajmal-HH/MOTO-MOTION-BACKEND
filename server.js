import express from 'express';
import cors from 'cors';
import userRouter from './Router/UserRouter.js';
import bikeOwnerRouter from './Router/BikeOwnerRouter.js';
import AdminRouter from './Router/AdminRouter.js';
import MessageRouter from './Router/MessageRouter.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import { app, server } from './socket/socket.js';  // Importing from socket.js
import sessionSecret from './config/config.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
connectDB();

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Session Middleware
app.use(session({
  secret: sessionSecret,
  saveUninitialized: true,
  resave: false
}));

//Middleware
app.use(cors({
  origin: ['https://moto-motion-frontend.vercel.app','https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app'],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true
}));

// const allowedOrigins = [
//   'https://moto-motion-frontend.vercel.app',
//   'https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
//   credentials: true
// }));;

// User Routes
app.use('/api/', userRouter);
// Bike Owner Routes
app.use('/api/bikeowner', bikeOwnerRouter);
// Admin Routes
app.use('/api/admin', AdminRouter);
// Message Routes
app.use('/api/messages', MessageRouter); 

app.use((err, req, res, next) => {
  console.log("Error in middleware", err);
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
