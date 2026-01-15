import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { startCleanupTask } from './utils/cleanup.utils';
import authRoutes from './routes/auth.routes';

// Configuration
dotenv.config();
const PORT = process.env.PORT || 3000;

// Services
const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

app.get('/', (_, res) => {
    res.json({ status: 'online', service: 'ZeroTrace Secure Node' });
});

const userSockets = new Map<string, string>(); // UserId -> SocketId

io.on('connection', (socket) => {
    socket.on('join', (userId: string) => {
        userSockets.set(userId, socket.id);
    });

    socket.on('private_message', async (payload: { senderId: string, receiverId: string, content: string, iv: string, ttl?: string }) => {
        const { senderId, receiverId, content, iv, ttl } = payload;

        let expiresAt: Date | undefined;
        if (ttl && ttl !== 'never') {
            let ms = 0;
            if (ttl === '1m') ms = 60000;
            else if (ttl === '1h') ms = 3600000;
            else if (ttl === '24h') ms = 86400000;
            else if (ttl.endsWith('m')) ms = parseInt(ttl) * 60000; // Custom minutes

            if (ms > 0) expiresAt = new Date(Date.now() + ms);
        }

        try {
            const message = await prisma.message.create({
                data: { senderId, receiverId, content, iv, expiresAt }
            });

            const targetSocket = userSockets.get(receiverId);
            if (targetSocket) {
                io.to(targetSocket).emit('new_message', message);
            }

            socket.emit('message_sent', message);

        } catch (err) {
            console.error('[GATEWAY] Message routing failed:', err);
        }
    });

    socket.on('disconnect', () => {
        for (const [uid, sid] of userSockets.entries()) {
            if (sid === socket.id) {
                userSockets.delete(uid);
                break;
            }
        }
    });
});

// Initialization
startCleanupTask();
httpServer.listen(PORT, () => {
    console.info(`[SYSTEM] Secure Server active on port ${PORT}`);
});
