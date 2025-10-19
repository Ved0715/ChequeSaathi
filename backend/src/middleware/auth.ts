import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types/auth';
import { verifyToken } from '@/utils/jwt';


export const authenticate = async (req:AuthRequest, res: Response, next: NextFunction):Promise<void> => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authentication token is missing' });
        return;
    }

    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Authentication token is missing' });
            return;
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
        
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid or expired authentication token' });
        return;
    }
};

