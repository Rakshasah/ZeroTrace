import { Router } from 'express';
import { register, login, getPublicKey, listUsers, getMessages } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// Public Key Retrieval
router.get('/keys/:userId', getPublicKey); // Public access for key exchange

// User Discovery & Messaging
router.get('/users', listUsers);
router.get('/messages', getMessages);

export default router;
