import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './logger';

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
    role: Joi.string().valid('collector', 'branch', 'buyer', 'transporter', 'admin').required(),
    authProvider: Joi.string().valid('email', 'phone', 'wallet', 'google').required()
});

export const googleLoginSchema = Joi.object({
    idToken: Joi.string().required(),
    role: Joi.string().valid('collector', 'branch', 'buyer', 'transporter', 'admin').optional()
});

export const walletLoginSchema = Joi.object({
    address: Joi.string().required(),
    message: Joi.string().required(),
    signature: Joi.string().required(),
    role: Joi.string().valid('collector', 'branch', 'buyer', 'transporter', 'admin').optional()
});
