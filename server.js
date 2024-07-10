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

app.use(cors({
  origin: [
    'https://moto-motion-frontend.vercel.app',
    'https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app',
    'https://moto-motion-frontend-e1jgg7lhs-mohamed-ajmals-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.options('*', cors({
  origin: [
    'https://moto-motion-frontend.vercel.app',
    'https://moto-motion-frontend-ozw2pv646-mohamed-ajmals-projects.vercel.app',
    'https://moto-motion-frontend-e1jgg7lhs-mohamed-ajmals-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  console.log("Error in middleware", err);
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
