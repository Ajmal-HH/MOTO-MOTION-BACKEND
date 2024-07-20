import express, { json } from 'express';
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
import { app, server } from './socket/socket.js';  
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

// Middleware
app.use(cors({
  origin: ['https://moto-motion-frontend.vercel.app','https://motomotoion.vercel.app/'],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true
}));

// User Routes
app.use('/api/', userRouter);
// Bike Owner Routes
app.use('/api/bikeowner', bikeOwnerRouter);
// Admin Routes
app.use('/api/admin', AdminRouter);
// Message Routes
app.use('/api/messages', MessageRouter);

app.use((err, req, res, next) => {
  console.error("Error in middleware", {
    message : err.message,
    stack : err.stack,
  });
  res.static(500),json({message : 'internal server error'})
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
