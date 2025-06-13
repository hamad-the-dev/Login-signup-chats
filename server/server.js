import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import groupRouter from './routes/groupRoutes.js';
import userAuth from './middleware/userAuth.js';

const app = express();
const port = process.env.PORT || 4000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();

const allowedOrigin = 'http://localhost:5173'

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res)=> res.send("API working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/groups', userAuth, groupRouter);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
   
    socket.emit('group_joined', { groupId });
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });
  socket.on('send_message', (messageData) => {
    console.log('Received message from client:', messageData);

    if (!messageData.groupId || !messageData.text) {
      console.error('Invalid message data received:', messageData);
      return;
    }
    socket.to(messageData.groupId).emit('receive_message', messageData);
    console.log(`Message broadcast to group ${messageData.groupId}`);
  });

  socket.on('message_deleted', ({ groupId, messageId }) => {
    console.log(`Message ${messageId} deleted from group ${groupId}`);
    socket.to(groupId).emit('message_deleted', { groupId, messageId });
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(port, () => console.log(`Server started on PORT:${port}`));
