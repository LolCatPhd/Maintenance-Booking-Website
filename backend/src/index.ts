import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import bookingRoutes from './routes/booking';
import solarSystemRoutes from './routes/solarSystem';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';
import aiCommandsRoutes from './routes/ai-commands';
import bulkSystemsRoutes from './routes/bulk-systems';
import csvImportRoutes from './routes/csv-import';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow requests from custom domain and Netlify frontend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://artisansolar.co.za',
  'https://www.artisansolar.co.za',
  'https://glittering-dieffenbachia-cb381d.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/solar-systems', solarSystemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-commands', aiCommandsRoutes);
app.use('/api/bulk-systems', bulkSystemsRoutes);
app.use('/api/csv-import', csvImportRoutes);

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
