import express from  "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import groupRouter from './routes/groupRoutes.js';
import userAuth from './middleware/userAuth.js';

const app = express();
const port = process.env.PORT || 4000;
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
app.use('/api/groups', userAuth, groupRouter); // Add group routes with authentication

app.listen(port, ()=> console.log(`Server started on PORT:${port}`));
