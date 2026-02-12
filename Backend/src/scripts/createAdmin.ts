import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole, UserStatus, AuthProvider } from '../types/user';

dotenv.config();

const createAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@ecolink.com'; // Change this to your desired admin email
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt); // Change this to a secure password

        const admin = new User({
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            authProvider: AuthProvider.EMAIL,
            isEmailVerified: true,
            phone: '+00000000000',
            location: {
                type: 'Point',
                coordinates: [0, 0],
                address: 'Admin HQ'
            }
        });

        // Validating manually or ensuring Schema validation passes
        // The pre-save hook we fixed earlier expects 'this' context, 
        // but since we are hashing manually here, we might want to bypass the pre-save hash 
        // OR just let the pre-save hook do it.
        // However, our pre-save hook checks isModified('password').
        // If we set hashed password directly, isModified is true.
        // Wait, if we pass already hashed password, the pre-save hook will hash it AGAIN if we are not careful.
        // The pre-save hook hashes if modified.
        // Let's rely on the pre-save hook! 

        // Reset path to plain text to let pre-save hook handle hashing
        admin.password = 'Admin@123';

        await admin.save();
        console.log('Admin created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: Admin@123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

createAdmin();
