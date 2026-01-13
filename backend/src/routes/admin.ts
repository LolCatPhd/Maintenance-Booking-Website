import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);
router.use(requireAdmin);

const createSlotSchema = z.object({
  date: z.string(),
  maxBookings: z.number().min(1).max(10),
});

const updateMaintenanceSchema = z.object({
  technicianName: z.string().optional(),
  findings: z.string().optional(),
  workPerformed: z.string().optional(),
  recommendations: z.string().optional(),
  nextServiceDue: z.string().optional(),
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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

router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        slot: true,
        payment: true,
      },
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

router.get('/slots', async (req, res) => {
  try {
    const slots = await prisma.availableSlot.findMany({
      include: {
        bookings: {
          where: {
            status: {
              notIn: ['CANCELLED'],
            },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

router.post('/slots', async (req, res) => {
  try {
    const data = createSlotSchema.parse(req.body);

    const slot = await prisma.availableSlot.create({
      data: {
        date: new Date(data.date),
        maxBookings: data.maxBookings,
        isAvailable: true,
      },
    });

    res.status(201).json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

router.post('/slots/bulk', async (req, res) => {
  try {
    const { startDate, endDate, maxBookings, excludeWeekends } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }

      slots.push({
        date: new Date(date),
        maxBookings: maxBookings || 2,
        isAvailable: true,
      });
    }

    const created = await prisma.availableSlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    res.json({ created: created.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slots' });
  }
});

router.patch('/slots/:id', async (req, res) => {
  try {
    const { isAvailable, maxBookings } = req.body;

    const slot = await prisma.availableSlot.update({
      where: { id: req.params.id },
      data: { isAvailable, maxBookings },
    });

    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

router.delete('/slots/:id', async (req, res) => {
  try {
    const slot = await prisma.availableSlot.findUnique({
      where: { id: req.params.id },
      include: { bookings: true },
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete slot with bookings' });
    }

    await prisma.availableSlot.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

router.post('/bookings/:bookingId/maintenance', async (req, res) => {
  try {
    const data = updateMaintenanceSchema.parse(req.body);
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const solarSystems = await prisma.solarSystem.findMany({
      where: { userId: booking.userId },
    });

    if (solarSystems.length === 0) {
      return res.status(400).json({ error: 'No solar system found for this user' });
    }

    const maintenance = await prisma.maintenanceVisit.upsert({
      where: { bookingId },
      update: {
        technicianName: data.technicianName,
        findings: data.findings,
        workPerformed: data.workPerformed,
        recommendations: data.recommendations,
        nextServiceDue: data.nextServiceDue ? new Date(data.nextServiceDue) : null,
        completedDate: new Date(),
      },
      create: {
        bookingId,
        solarSystemId: solarSystems[0].id,
        visitDate: booking.slot.date,
        technicianName: data.technicianName,
        findings: data.findings,
        workPerformed: data.workPerformed,
        recommendations: data.recommendations,
        nextServiceDue: data.nextServiceDue ? new Date(data.nextServiceDue) : null,
        completedDate: new Date(),
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });

    res.json(maintenance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update maintenance visit' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' },
    });
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' },
    });
    const totalRevenue = await prisma.payment.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    });
    const totalUsers = await prisma.user.count({
      where: { role: 'CLIENT' },
    });

    res.json({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users/locations', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        latitude: true,
        longitude: true,
        formattedAddress: true,
        city: true,
        province: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            solarSystems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group users by province for statistics
    const byProvince: Record<string, number> = {};
    const byCity: Record<string, number> = {};

    users.forEach(user => {
      if (user.province) {
        byProvince[user.province] = (byProvince[user.province] || 0) + 1;
      }
      if (user.city) {
        byCity[user.city] = (byCity[user.city] || 0) + 1;
      }
    });

    res.json({
      users,
      statistics: {
        total: users.length,
        byProvince,
        byCity,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user locations' });
  }
});

export default router;
