import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ['appetizer', 'main', 'dessert', 'drink'], required: true },
  available: { type: Boolean, default: true },
  image: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);