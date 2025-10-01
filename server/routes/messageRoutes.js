import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import {
  getMessage,
  getUserForSideBar,
  markMessageAsSeen,
  sendMessage,
  markConversationAsSeen,
} from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectedRoute, getUserForSideBar);
messageRouter.get('/:id', protectedRoute, getMessage);

// fix: verbs to PUT
messageRouter.put('/mark/:id', protectedRoute, markMessageAsSeen);
messageRouter.put(
  '/mark-conversation/:id',
  protectedRoute,
  markConversationAsSeen
);

messageRouter.post('/send/:id', protectedRoute, sendMessage);

export default messageRouter;
