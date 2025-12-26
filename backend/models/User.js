import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'chef', 'waiter', 'customer'], required: true },
  phone: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);