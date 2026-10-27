import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  provider: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, enum: ['Meals', 'Bakery', 'Produce', 'Snacks', 'Drinks'], default: 'Meals' },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  portions: { type: Number, required: true, min: 0, max: 500 },
  pickup: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  expiresAt: { type: Date, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'closed'], default: 'available' }
}, { timestamps: true });

mealSchema.index({ status: 1, expiresAt: 1, createdAt: -1 });
export default mongoose.model('Meal', mealSchema);
