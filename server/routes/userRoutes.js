import express from 'express';
import { getUserData, getOnlineUsers } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/online-users', userAuth, getOnlineUsers);

export default userRouter;
