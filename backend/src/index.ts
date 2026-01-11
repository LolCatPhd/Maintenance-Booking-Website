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

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/solar-systems', solarSystemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Artisan Solar Booking API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Solar Booking API is running' });
});

// Bind to 0.0.0.0 to accept connections from Railway's proxy
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and bound to 0.0.0.0`);
});
