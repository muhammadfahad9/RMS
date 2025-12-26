import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, default: 'Guest Customer' },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true },
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  assignedWaiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedChef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);