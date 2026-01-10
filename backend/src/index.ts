import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import bookingRoutes from './routes/booking';
import solarSystemRoutes from './routes/solarSystem';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/solar-systems', solarSystemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Solar Booking API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
