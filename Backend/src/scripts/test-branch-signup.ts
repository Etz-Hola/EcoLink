import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AuthService } from '../services/authService';
import User from '../models/User';
import Invite from '../models/Invite';
import { UserRole, AuthProvider } from '../types/user';
import { InviteStatus } from '../types/invite';

dotenv.config();

async function runTest() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecolink');
        console.log('Connected.');

        const testEmail = `test_branch_${Date.now()}@example.com`;
        const testCode = `TEST-INVITE-${Date.now()}`;

        // 1. Create a mock admin user for invite creation context
        let admin = await User.findOne({ role: UserRole.ADMIN });
        if (!admin) {
            console.log('No admin user found for testing. Creating temporary mock admin...');
            admin = new User({
                username: `test_admin_${Date.now()}`,
                email: `admin_${Date.now()}@example.com`,
                password: 'password123',
                firstName: 'Admin',
                lastName: 'User',
                role: UserRole.ADMIN,
                authProvider: AuthProvider.EMAIL,
                status: 'active'
            });
            await admin.save();
        }

        // 2. Create a test invite
        console.log(`Creating test invite: ${testCode}`);
        const invite = new Invite({
            code: testCode,
            organizationId: admin._id,
            businessName: 'Test Branch Hub',
            role: UserRole.BRANCH,
            createdBy: admin._id,
            status: InviteStatus.PENDING,
            expiresAt: new Date(Date.now() + 3600000) // 1 hour
        });
        await invite.save();

        // 3. Test Branch Registration with valid code
        console.log('Testing Branch registration with valid code...');
        const regResult = await AuthService.register({
            username: `hubmanager_${Date.now()}`,
            email: testEmail,
            password: 'password123',
            firstName: 'Hub',
            lastName: 'Manager',
            role: UserRole.BRANCH,
            authProvider: AuthProvider.EMAIL,
            inviteCode: testCode,
            businessName: 'My Hub'
        });

        if (regResult.success && regResult.user?.status === 'active' && regResult.user?.organizationId?.toString() === regResult.user?._id?.toString()) {
            console.log('✅ Branch registration SUCCESSFUL');
        } else {
            console.error('❌ Branch registration FAILED', JSON.stringify(regResult, null, 2));
        }

        // 4. Verify invite is marked used
        const usedInvite = await Invite.findOne({ code: testCode });
        if (usedInvite?.status === InviteStatus.USED) {
            console.log('✅ Invite marked as USED');
        } else {
            console.error('❌ Invite status NOT UPDATED');
        }

        // 5. Cleanup
        console.log('Cleaning up test data...');
        await User.deleteOne({ email: testEmail });
        await Invite.deleteOne({ code: testCode });

        await mongoose.disconnect();
        console.log('Test completed.');
    } catch (error) {
        console.error('Test FAILED with error:', error);
        process.exit(1);
    }
}

runTest();
