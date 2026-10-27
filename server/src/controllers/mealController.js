import Meal from '../models/Meal.js';
import Reservation from '../models/Reservation.js';

const categories = ['Meals', 'Bakery', 'Produce', 'Snacks', 'Drinks'];

export async function listMeals(req, res, next) {
  try {
    const { search = '', category = 'all', sort = 'soon' } = req.query;
    const filter = { status: 'available', portions: { $gt: 0 }, expiresAt: { $gt: new Date() } };
    if (category !== 'all') {
      if (!categories.includes(category)) return res.status(400).json({ message: 'Invalid category.' });
      filter.category = category;
    }
    if (search.trim()) filter.$or = [
      { name: { $regex: escapeRegex(search.trim()), $options: 'i' } },
      { provider: { $regex: escapeRegex(search.trim()), $options: 'i' } },
      { description: { $regex: escapeRegex(search.trim()), $options: 'i' } }
    ];
    const sortOption = sort === 'new' ? { createdAt: -1 } : sort === 'qty' ? { portions: -1 } : { expiresAt: 1 };
    const meals = await Meal.find(filter).sort(sortOption).populate('owner', 'name');
    res.json({ meals });
  } catch (error) { next(error); }
}
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function createMeal(req, res, next) {
  try {
    const { name, provider, category = 'Meals', description = '', portions, pickup, location, expiresAt } = req.body;
    if (!name?.trim() || !provider?.trim() || !pickup?.trim() || !location?.trim()) return res.status(400).json({ message: 'Name, provider, pickup window and location are required.' });
    if (!categories.includes(category)) return res.status(400).json({ message: 'Choose a valid category.' });
    const count = Number(portions), expiry = new Date(expiresAt);
    if (!Number.isInteger(count) || count < 1 || count > 500) return res.status(400).json({ message: 'Portions must be a whole number from 1 to 500.' });
    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) return res.status(400).json({ message: 'Expiry must be a future date and time.' });
    const meal = await Meal.create({ name, provider, category, description, portions: count, pickup, location, expiresAt: expiry, owner: req.user._id });
    res.status(201).json({ meal: await meal.populate('owner', 'name') });
  } catch (error) { next(error); }
}

export async function myMeals(req, res, next) {
  try { const meals = await Meal.find({ owner: req.user._id }).sort({ createdAt: -1 }); res.json({ meals }); }
  catch (error) { next(error); }
}

export async function closeMeal(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, owner: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Listing not found.' });
    meal.status = 'closed'; await meal.save(); res.json({ meal });
  } catch (error) { next(error); }
}

export async function reserveMeal(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, status: 'available', expiresAt: { $gt: new Date() }, portions: { $gt: 0 } });
    if (!meal) return res.status(409).json({ message: 'This meal is no longer available.' });
    if (meal.owner.equals(req.user._id)) return res.status(400).json({ message: 'You cannot reserve your own listing.' });
    const already = await Reservation.findOne({ meal: meal._id, user: req.user._id, status: 'reserved' });
    if (already) return res.status(409).json({ message: 'You already reserved a portion of this meal.' });
    // Conditional update prevents two requests from reserving the last portion at once.
    const updated = await Meal.findOneAndUpdate({ _id: meal._id, status: 'available', portions: { $gt: 0 }, expiresAt: { $gt: new Date() } }, { $inc: { portions: -1 } }, { new: true });
    if (!updated) return res.status(409).json({ message: 'This meal was just reserved by someone else.' });
    try {
      const reservation = await Reservation.create({ meal: meal._id, user: req.user._id });
      res.status(201).json({ reservation: await reservation.populate('meal') });
    } catch (error) {
      await Meal.updateOne({ _id: meal._id }, { $inc: { portions: 1 } });
      throw error;
    }
  } catch (error) { next(error); }
}

export async function myReservations(req, res, next) {
  try { const reservations = await Reservation.find({ user: req.user._id }).populate({ path: 'meal', populate: { path: 'owner', select: 'name' } }).sort({ createdAt: -1 }); res.json({ reservations }); }
  catch (error) { next(error); }
}

export async function updateReservation(req, res, next) {
  try {
    const { status } = req.body;
    if (!['picked-up', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid reservation status.' });
    const reservation = await Reservation.findOne({ _id: req.params.id, user: req.user._id }).populate('meal');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found.' });
    if (reservation.status !== 'reserved') return res.status(409).json({ message: 'This reservation is already completed or cancelled.' });
    reservation.status = status; await reservation.save();
    if (status === 'cancelled' && reservation.meal && reservation.meal.status === 'available' && reservation.meal.expiresAt > new Date()) {
      await Meal.updateOne({ _id: reservation.meal._id }, { $inc: { portions: 1 } });
    }
    res.json({ reservation });
  } catch (error) { next(error); }
}
