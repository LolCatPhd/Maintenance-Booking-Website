import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createSystemSchema = z.object({
  systemName: z.string().min(1),
  installationDate: z.string(),
  address: z.string().min(1),
});

const createComponentSchema = z.object({
  componentType: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  serialNumber: z.string().optional(),
  installDate: z.string(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const systems = await prisma.solarSystem.findMany({
      where: { userId: req.userId },
      include: {
        components: true,
        maintenanceVisits: {
          orderBy: { visitDate: 'desc' },
          take: 5,
        },
      },
    });

    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch solar systems' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createSystemSchema.parse(req.body);

    const system = await prisma.solarSystem.create({
      data: {
        userId: req.userId!,
        systemName: data.systemName,
        installationDate: new Date(data.installationDate),
        address: data.address,
      },
      include: {
        components: true,
      },
    });

    res.status(201).json(system);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create solar system' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const system = await prisma.solarSystem.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        components: true,
        maintenanceVisits: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    if (!system) {
      return res.status(404).json({ error: 'Solar system not found' });
    }

    res.json(system);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch solar system' });
  }
});

router.post('/:id/components', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createComponentSchema.parse(req.body);

    const system = await prisma.solarSystem.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!system) {
      return res.status(404).json({ error: 'Solar system not found' });
    }

    const component = await prisma.systemComponent.create({
      data: {
        solarSystemId: req.params.id,
        componentType: data.componentType,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        installDate: new Date(data.installDate),
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        notes: data.notes,
      },
    });

    res.status(201).json(component);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to add component' });
  }
});

export default router;
