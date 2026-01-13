import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        latitude: true,
        longitude: true,
        formattedAddress: true,
        streetAddress: true,
        city: true,
        province: true,
        postalCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      latitude,
      longitude,
      formattedAddress,
      streetAddress,
      city,
      province,
      postalCode,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName,
        lastName,
        phone,
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(formattedAddress !== undefined && { formattedAddress }),
        ...(streetAddress !== undefined && { streetAddress }),
        ...(city !== undefined && { city }),
        ...(province !== undefined && { province }),
        ...(postalCode !== undefined && { postalCode }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        latitude: true,
        longitude: true,
        formattedAddress: true,
        streetAddress: true,
        city: true,
        province: true,
        postalCode: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
