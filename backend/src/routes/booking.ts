import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createBookingSchema = z.object({
  slotId: z.string(),
  serviceType: z.enum([
    'ROUTINE_INSPECTION',
    'PANEL_CLEANING',
    'INVERTER_SERVICE',
    'ELECTRICAL_CHECK',
    'FULL_MAINTENANCE',
    'EMERGENCY_REPAIR',
  ]),
  address: z.string().min(1),
  notes: z.string().optional(),
});

router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const slots = await prisma.availableSlot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isAvailable: true,
      },
      include: {
        bookings: {
          where: {
            status: {
              notIn: ['CANCELLED'],
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const availableSlots = slots
      .filter((slot) => slot.bookings.length < slot.maxBookings)
      .map((slot) => ({
        id: slot.id,
        date: slot.date,
        availableSpots: slot.maxBookings - slot.bookings.length,
        maxBookings: slot.maxBookings,
      }));

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      include: {
        slot: true,
        payment: true,
        maintenanceVisit: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const slot = await prisma.availableSlot.findUnique({
      where: { id: data.slotId },
      include: {
        bookings: {
          where: {
            status: {
              notIn: ['CANCELLED'],
            },
          },
        },
      },
    });

    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    if (slot.bookings.length >= slot.maxBookings) {
      return res.status(400).json({ error: 'Slot is fully booked' });
    }

    const serviceRates: Record<string, number> = {
      ROUTINE_INSPECTION: 150,
      PANEL_CLEANING: 200,
      INVERTER_SERVICE: 250,
      ELECTRICAL_CHECK: 180,
      FULL_MAINTENANCE: 400,
      EMERGENCY_REPAIR: 350,
    };

    const totalAmount = serviceRates[data.serviceType] || 200;

    const booking = await prisma.booking.create({
      data: {
        userId: req.userId!,
        slotId: data.slotId,
        serviceType: data.serviceType,
        address: data.address,
        notes: data.notes,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        slot: true,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        slot: true,
        payment: true,
        maintenanceVisit: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'COMPLETED' || booking.status === 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        slot: true,
        payment: true,
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
