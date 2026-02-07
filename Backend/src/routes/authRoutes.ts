import express from 'express';
import { AuthService } from '../services/authService';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema, googleLoginSchema, walletLoginSchema } from '../utils/validators';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 */
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email/phone/wallet
 */
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
    try {
        const result = await AuthService.login(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/v1/auth/google
 * @desc    Login/Signup with Google
 */
router.post('/google', validateRequest(googleLoginSchema), async (req, res, next) => {
    try {
        const { idToken, role } = req.body;
        const result = await AuthService.googleLogin(idToken, role);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/v1/auth/nonce
 * @desc    Get nonce for SIWE
 */
router.get('/nonce', (req, res) => {
    const nonce = AuthService.generateNonce();
    res.status(200).json({ nonce });
});

/**
 * @route   POST /api/v1/auth/verify-wallet
 * @desc    Verify SIWE signature and login
 */
router.post('/verify-wallet', validateRequest(walletLoginSchema), async (req, res, next) => {
    try {
        const result = await AuthService.verifyWalletLogin(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
