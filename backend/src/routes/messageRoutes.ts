import { Router } from 'express';
import {
  generateMessage,
  generateMessageVariations
} from '../controllers/messageController';

const router = Router();

// LinkedIn message generation routes
router.post('/personalized-message', generateMessage);
router.post('/personalized-message/variations', generateMessageVariations);

export default router; 