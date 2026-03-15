import express from 'express';
import { AdminController } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/user';

const router = express.Router();

router.get('/stats', protect, authorize(UserRole.ADMIN), AdminController.getGlobalStats);
router.get('/users', protect, authorize(UserRole.ADMIN), AdminController.getUsers);
router.patch('/users/:id', protect, authorize(UserRole.ADMIN), AdminController.updateUser);
router.patch('/users/:id/approve', protect, authorize(UserRole.ADMIN), AdminController.approveUser);
router.patch('/users/:id/reject', protect, authorize(UserRole.ADMIN), AdminController.rejectUser);
router.post('/invites/generate', protect, authorize(UserRole.ADMIN), AdminController.generateInvite);
router.get('/invites', protect, authorize(UserRole.ADMIN), AdminController.getInvites);
router.get('/branches/pending', protect, authorize(UserRole.ADMIN), AdminController.getPendingBranches);
router.patch('/branches/:id/approve', protect, authorize(UserRole.ADMIN), AdminController.approveBranch);
router.patch('/branches/:id/reject', protect, authorize(UserRole.ADMIN), AdminController.rejectBranch);
router.patch('/exporters/:id/approve', protect, authorize(UserRole.ADMIN), AdminController.approveExporter);
router.get('/exporters/pending', protect, authorize(UserRole.ADMIN), AdminController.getPendingExporters);
router.patch('/exporters/:id/reject', protect, authorize(UserRole.ADMIN), AdminController.rejectExporter);
router.get('/materials', protect, authorize(UserRole.ADMIN), AdminController.getMaterials);
router.get('/bundles', protect, authorize(UserRole.ADMIN), AdminController.getBundles);
router.get('/transactions', protect, authorize(UserRole.ADMIN), AdminController.getTransactions);

export default router;
