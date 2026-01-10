# Quick Setup Guide

## Prerequisites Check
- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL v14+ installed and running
- [ ] Stripe account created (get test keys from dashboard)

## Setup Steps

### 1. Install Dependencies
```bash
# From project root
npm run install:all
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb solar_booking

# Or using psql
psql -U postgres
CREATE DATABASE solar_booking;
\q
```

### 3. Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/solar_booking"
JWT_SECRET="your-super-secret-jwt-key-change-this"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
PORT=5000
NODE_ENV=development
```

### 4. Run Database Migrations
```bash
# Still in backend directory
npm run prisma:generate
npm run prisma:migrate
```

### 5. Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
```

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

## Create Admin User

1. Register a normal user at http://localhost:3000/register
2. Open Prisma Studio:
```bash
cd backend
npm run prisma:studio
```
3. Go to the User model
4. Find your user and change `role` from `CLIENT` to `ADMIN`
5. Save and refresh your browser

## Test Stripe Payments

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Any future expiry date**
- **Any 3-digit CVC**

## Troubleshooting

### Port already in use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection issues
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
# On macOS:
brew services restart postgresql

# On Linux:
sudo systemctl restart postgresql
```

### Prisma errors
```bash
cd backend
rm -rf node_modules
npm install
npm run prisma:generate
npm run prisma:migrate
```

## Next Steps

1. Create some availability slots in admin panel
2. Add a solar system in "My Systems"
3. Book a maintenance service
4. Test the payment flow
5. Check the dashboard and reports

## Support

Check the main README.md for detailed documentation.
