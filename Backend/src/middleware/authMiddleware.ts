import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/logger';
import User from '../models/User';
import { UserRole } from '../types/user';

interface JwtPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        // ── Step 1: Check for Emergency Admin Token ──
        if (process.env.ADMIN_SECRET_KEY) {
            try {
                const adminDecoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY) as any;
                if (adminDecoded.userId === 'admin-emergency' && adminDecoded.isAdmin) {
                    req.user = {
                        _id: 'admin-emergency',
                        id: 'admin-emergency',
                        email: adminDecoded.email,
                        role: UserRole.ADMIN,
                        status: 'active',
                        username: 'admin',
                        firstName: 'EcoLink',
                        lastName: 'Admin'
                    };
                    return next();
                }
            } catch (err) {
                // Not an emergency admin token, or expired. Continue to standard check.
            }
        }

        // ── Step 2: Standard User Token Check ──
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
};

export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
