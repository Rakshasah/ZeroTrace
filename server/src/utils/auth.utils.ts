import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const hashPassword = async (password: string): Promise<string> => {
    return await argon2.hash(password);
};

export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
    try {
        return await argon2.verify(hash, plain);
    } catch (err) {
        return false;
    }
};

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};
