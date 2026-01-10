# Solar Maintenance Booking Website

A comprehensive web application for residential solar system owners to book maintenance services with secure payment processing and system tracking.

## Features

### Client Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Dashboard**: Overview of solar systems, bookings, and maintenance history
- **Booking System**: Interactive calendar to select available maintenance dates
- **Multiple Services**:
  - Routine Inspection ($150)
  - Panel Cleaning ($200)
  - Inverter Service ($250)
  - Electrical Check ($180)
  - Full Maintenance ($400)
  - Emergency Repair ($350)
- **Payment Processing**:
  - Credit card payments via Stripe
  - EFT/Bank transfer option
- **Solar System Management**: Track system components and maintenance history
- **Service History**: View past maintenance visits with detailed reports

### Admin Features
- **Dashboard**: Overview statistics and revenue tracking
- **Booking Management**: View and update booking statuses
- **Availability Management**: Create and manage available time slots
- **Bulk Slot Creation**: Add multiple availability slots at once
- **Service Reports**: Add maintenance visit details and recommendations

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- Stripe payment integration
- Bcrypt for password hashing
- Zod for validation

### Frontend
- React 18 + TypeScript
- Vite for fast development
- TailwindCSS for styling
- Zustand for state management
- React Router for navigation
- React Calendar for date selection
- Stripe Elements for payments
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Stripe account for payment processing

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Maintenance-Booking-Website
```

2. **Backend Setup**
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: A secure random string
# - STRIPE_SECRET_KEY: Your Stripe secret key
# - PORT: Backend port (default: 5000)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with:
# - VITE_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Database Setup

The application uses PostgreSQL. Create a database and update the `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/solar_booking"
```

Then run migrations:
```bash
cd backend
npm run prisma:migrate
```

### Creating an Admin User

To create an admin user, you can:
1. Register a normal user through the UI
2. Use Prisma Studio to update the user's role to `ADMIN`:
```bash
cd backend
npm run prisma:studio
```

Or directly update via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Project Structure

```
Maintenance-Booking-Website/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── middleware/           # Auth middleware
│   │   └── routes/               # API routes
│   │       ├── auth.ts           # Authentication
│   │       ├── user.ts           # User management
│   │       ├── booking.ts        # Booking operations
│   │       ├── solarSystem.ts    # Solar system management
│   │       ├── payment.ts        # Payment processing
│   │       └── admin.ts          # Admin operations
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   └── Layout.tsx        # Main layout
│   │   ├── pages/                # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Bookings.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── SolarSystems.tsx
│   │   │   ├── Payment.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/             # API services
│   │   │   └── api.ts
│   │   ├── store/                # State management
│   │   │   └── authStore.ts
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Bookings
- `GET /api/bookings/available-slots` - Get available dates
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Solar Systems
- `GET /api/solar-systems` - Get user's systems
- `POST /api/solar-systems` - Add new system
- `GET /api/solar-systems/:id` - Get system details
- `POST /api/solar-systems/:id/components` - Add component

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Admin (Requires Admin Role)
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/bookings/:id/status` - Update booking status
- `GET /api/admin/slots` - Get all slots
- `POST /api/admin/slots` - Create slot
- `POST /api/admin/slots/bulk` - Create bulk slots
- `PATCH /api/admin/slots/:id` - Update slot
- `DELETE /api/admin/slots/:id` - Delete slot
- `POST /api/admin/bookings/:id/maintenance` - Add maintenance report
- `GET /api/admin/stats` - Get statistics

## Payment Integration

The application uses Stripe for payment processing:

1. **Credit Card Payments**: Fully integrated with Stripe Elements
2. **EFT/Bank Transfer**: Manual process with reference tracking

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to environment files:
   - Backend: `STRIPE_SECRET_KEY` in `backend/.env`
   - Frontend: `VITE_STRIPE_PUBLISHABLE_KEY` in `frontend/.env`

For testing, use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build: `npm run build`
5. Start: `npm start`

### Frontend Deployment
1. Update API URL in `.env`
2. Build: `npm run build`
3. Deploy the `dist` folder to your hosting service

Popular hosting options:
- Frontend: Vercel, Netlify, AWS S3
- Backend: Heroku, AWS EC2, DigitalOcean
- Database: AWS RDS, Heroku Postgres, DigitalOcean

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/solar_booking
JWT_SECRET=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable
VITE_API_URL=http://localhost:5000/api
```

## Features Overview

### For Clients
1. Register and create account
2. Add solar system details and components
3. Browse available maintenance dates
4. Book services with instant confirmation
5. Pay securely via credit card or EFT
6. View booking history and service reports
7. Track system maintenance schedule

### For Administrators
1. View dashboard with statistics
2. Manage all bookings
3. Create and manage availability slots
4. Update booking statuses
5. Add maintenance visit reports
6. Track revenue and performance

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection
- CORS configuration

## Future Enhancements
- Email notifications for booking confirmations
- SMS reminders for scheduled maintenance
- Mobile app (React Native)
- Advanced reporting and analytics
- Customer reviews and ratings
- Multi-language support
- Automated scheduling optimization
- Integration with solar monitoring systems

## Support

For issues or questions:
1. Check the documentation
2. Review existing issues in the repository
3. Create a new issue with detailed information

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ for solar system owners and maintenance providers
