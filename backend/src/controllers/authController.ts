import { Response } from "express";
import {AuthRequest, RegisterBody, AuthResponse, LoginBody} from "@/types/auth";
import { hashPassword, comparePassword } from "@/utils/password";
import { generateToken } from "@/utils/jwt";
import prisma from '@/config/database'




export const register = async ( req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {email, password, name} = req.body as RegisterBody;

        if (!email || !password || !name) {
            res.status(400).json({ message: 'Email, password, and name are required.' });
            return;
        }

        const existingUser = await prisma.user.findUnique({where: {email}});
        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists.' });
            return;
        }
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        });
        
        const token = generateToken({
            id: user.id,
            email: user.email,
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 Days
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        } as AuthResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async ( req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body as LoginBody;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }
        const user  = await prisma.user.findUnique({where: {email}});

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 Days
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        } as AuthResponse);  
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = async ( req: AuthRequest, res: Response): Promise<void> => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error'
        })
    }
}


export const getProfile = async ( req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}