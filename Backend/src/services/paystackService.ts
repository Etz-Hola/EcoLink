import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';
import { AppError } from '../utils/logger';

export interface IPaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface IPaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string | null;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: any;
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            customer_code: string;
            phone: string | null;
            metadata: any | null;
            risk_action: string;
        };
    };
}

export class PaystackService {
    private static readonly PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
    private static readonly PAYSTACK_BASE_URL = 'https://api.paystack.co';

    /**
     * Initialize a transaction
     */
    static async initializeTransaction(
        email: string,
        amountNgn: number,
        metadata?: any
    ): Promise<IPaystackInitializeResponse> {
        try {
            const response = await axios.post<IPaystackInitializeResponse>(
                `${this.PAYSTACK_BASE_URL}/transaction/initialize`,
                {
                    email,
                    amount: Math.round(amountNgn * 100), // convert to kobo
                    metadata,
                    callback_url: `${process.env.FRONTEND_URL}/payment/verify`
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data.status) {
                throw new AppError(response.data.message || 'Paystack initialization failed', 400);
            }

            return response.data;
        } catch (error: any) {
            logger.error('Paystack initialize error:', error.response?.data || error.message);
            throw new AppError(error.response?.data?.message || 'Failed to initialize Paystack payment', 500);
        }
    }

    /**
     * Verify a transaction
     */
    static async verifyTransaction(reference: string): Promise<IPaystackVerifyResponse> {
        try {
            const response = await axios.get<IPaystackVerifyResponse>(
                `${this.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`
                    }
                }
            );

            if (!response.data.status) {
                throw new AppError(response.data.message || 'Paystack verification failed', 400);
            }

            return response.data;
        } catch (error: any) {
            logger.error('Paystack verify error:', error.response?.data || error.message);
            throw new AppError(error.response?.data?.message || 'Failed to verify Paystack payment', 500);
        }
    }

    /**
     * Verify Paystack Webhook Persona/Signature
     */
    static verifyWebhookSignature(body: string, signature: string): boolean {
        const hash = crypto
            .createHmac('sha512', this.PAYSTACK_SECRET_KEY)
            .update(body)
            .digest('hex');
        return hash === signature;
    }
}
