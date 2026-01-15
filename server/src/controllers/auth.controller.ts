import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.utils';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, publicKey } = req.body;

        if (!username || !password || !publicKey) {
            res.status(400).json({ error: 'Missing fields' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            res.status(400).json({ error: 'Username taken' });
            return;
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                publicKey
            }
        });

        const token = generateToken(user.id);

        res.json({ token, user: { id: user.id, username: user.username, publicKey: user.publicKey } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, publicKey } = req.body;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // ROTATE KEYS: Update public key for this new session
        // This ensures the current session's private key matches the public key others see.
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { publicKey: publicKey || user.publicKey } // Fallback if not provided, but should be
        });

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                publicKey: updatedUser.publicKey
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Endpoint to fetch public keys for other users
export const getPublicKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params as { userId: string };

        if (!userId) {
            res.status(400).json({ error: 'Missing User ID' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ publicKey: user.publicKey });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching key' });
    }
};

// Endpoint to list all users
export const listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                publicKey: true,
                lastSeen: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Endpoint to fetch message history between two users
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { currentUserId, targetUserId } = req.query as { currentUserId: string, targetUserId: string };

        if (!currentUserId || !targetUserId) {
            res.status(400).json({ error: 'Missing User IDs' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};
