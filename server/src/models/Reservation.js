import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['reserved', 'picked-up', 'cancelled'], default: 'reserved' }
}, { timestamps: true });

reservationSchema.index({ meal: 1, user: 1, status: 1 });
export default mongoose.model('Reservation', reservationSchema);
