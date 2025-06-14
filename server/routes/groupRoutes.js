import express from 'express';
import { createGroup, getUserGroups, updateGroup, deleteGroup, renameGroup, sendMessage, getAllGroups, deleteMessages, deleteMessage} from '../controllers/groupController.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// Apply userAuth middleware to all group routes
router.post('/create', userAuth, createGroup);
router.get('/user-groups', userAuth, getUserGroups);
router.get('/all-groups', userAuth, getAllGroups);
router.put('/:groupId', userAuth, updateGroup);
router.put('/:groupId/rename', userAuth, renameGroup);
router.delete('/:groupId', userAuth, deleteGroup);
router.delete('/:groupId/messages', userAuth, deleteMessages);
router.delete('/:groupId/message/:messageId', userAuth, deleteMessage);

router.post('/message', userAuth, sendMessage);

export default router;
