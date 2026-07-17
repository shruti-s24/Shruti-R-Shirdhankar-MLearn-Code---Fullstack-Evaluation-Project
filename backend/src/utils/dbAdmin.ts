import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Admin } from '../models/admin.model';

dotenv.config();

async function seedAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');

  await mongoose.connect(uri);

  const email = 'admin@test.com';
  const plainPassword = 'admin123';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists, skipping.');
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await Admin.create({
    name: 'System Admin',
    email,
    passwordHash,
    status: 'active',
  });

  console.log('Admin created — email:', email, '| password:', plainPassword);
  await mongoose.disconnect();
}

seedAdmin();