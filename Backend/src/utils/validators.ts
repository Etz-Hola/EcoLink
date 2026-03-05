import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './logger';

const VALID_ROLES = ['collector', 'branch', 'buyer', 'transporter', 'admin', 'organization', 'hotel', 'exporter'];

export const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().when('identifier', {
        is: Joi.string().email(),
        then: Joi.required(),
        otherwise: Joi.optional() 
    }),
    signature: Joi.string().optional(),
    message: Joi.string().optional()
});

export const registerSchema = Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    password: Joi.string().min(6).optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid(...VALID_ROLES).required(),
    authProvider: Joi.string().valid('email', 'phone', 'wallet', 'google').required()
});

export const googleLoginSchema = Joi.object({
    idToken: Joi.string().required(),
    role: Joi.string().valid(...VALID_ROLES).optional()
});

export const walletLoginSchema = Joi.object({
    address: Joi.string().required(),
    message: Joi.string().required(),
    signature: Joi.string().required(),
    role: Joi.string().valid(...VALID_ROLES).optional()
});

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { allowUnknown: true });
        if (error) {
            return next(new AppError(error.details[0]!.message, 400));
        }
        next();
    };
};