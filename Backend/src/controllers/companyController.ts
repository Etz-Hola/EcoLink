import { Request, Response, NextFunction } from 'express';
import Company from '../models/Company';
import { AppError } from '../utils/logger';

export class CompanyController {
    /**
     * Get the authenticated exporter's own Company document
     * @route GET /api/v1/companies/my-company
     */
    static async getMyCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;

            if (!user.companyId) {
                throw new AppError('No company linked to this account', 404);
            }

            const company = await Company.findById(user.companyId);
            if (!company) {
                throw new AppError('Company not found', 404);
            }

            res.status(200).json({
                success: true,
                data: company
            });
        } catch (error) {
            next(error);
        }
    }
}
