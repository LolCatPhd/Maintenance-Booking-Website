import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/bulk-systems - Get all users with their solar systems
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      search,
      province,
      city,
      hasSystem,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      role: 'CLIENT',
    };

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { firstName: { contains: searchStr, mode: 'insensitive' } },
        { lastName: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { phone: { contains: searchStr } },
      ];
    }

    if (province && province !== 'all') {
      where.province = province;
    }

    if (city && city !== 'all') {
      where.city = city;
    }

    // Get total count
    const totalUsers = await prisma.user.count({ where });

    // Get users with their systems and components
    const users = await prisma.user.findMany({
      where,
      include: {
        solarSystems: {
          orderBy: { createdAt: 'desc' },
          include: {
            components: {
              orderBy: { componentType: 'asc' },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      skip,
      take: limitNum,
    });

    // Filter by hasSystem if specified
    let filteredUsers = users;
    if (hasSystem === 'true') {
      filteredUsers = users.filter(u => u.solarSystems.length > 0);
    } else if (hasSystem === 'false') {
      filteredUsers = users.filter(u => u.solarSystems.length === 0);
    }

    res.json({
      users: filteredUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bulk systems:', error);
    res.status(500).json({ error: 'Failed to fetch systems' });
  }
});

// POST /api/bulk-systems/system - Create a new solar system for a user
router.post('/system', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      userId,
      systemName,
      installationDate,
      address,
      inverterModel,
      batteryModel,
      batteryQuantity,
      solarPanelWattage,
      solarPanelQuantity,
      monitoringPlatformUrl,
    } = req.body;

    if (!userId || !systemName) {
      return res.status(400).json({ error: 'userId and systemName are required' });
    }

    const system = await prisma.solarSystem.create({
      data: {
        userId,
        systemName,
        installationDate: installationDate ? new Date(installationDate) : new Date(),
        address: address || '',
        inverterModel: inverterModel || null,
        batteryModel: batteryModel || null,
        batteryQuantity: batteryQuantity ? parseInt(batteryQuantity) : null,
        solarPanelWattage: solarPanelWattage || null,
        solarPanelQuantity: solarPanelQuantity ? parseInt(solarPanelQuantity) : null,
        monitoringPlatformUrl: monitoringPlatformUrl || null,
      },
    });

    res.status(201).json(system);
  } catch (error: any) {
    console.error('Error creating system:', error);
    res.status(500).json({ error: 'Failed to create system' });
  }
});

// PUT /api/bulk-systems/system/:id - Update a solar system
router.put('/system/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      systemName,
      installationDate,
      address,
      inverterModel,
      batteryModel,
      batteryQuantity,
      solarPanelWattage,
      solarPanelQuantity,
      monitoringPlatformUrl,
    } = req.body;

    const updateData: any = {};

    if (systemName !== undefined) updateData.systemName = systemName;
    if (installationDate !== undefined) updateData.installationDate = new Date(installationDate);
    if (address !== undefined) updateData.address = address;
    if (inverterModel !== undefined) updateData.inverterModel = inverterModel || null;
    if (batteryModel !== undefined) updateData.batteryModel = batteryModel || null;
    if (batteryQuantity !== undefined) updateData.batteryQuantity = batteryQuantity ? parseInt(batteryQuantity) : null;
    if (solarPanelWattage !== undefined) updateData.solarPanelWattage = solarPanelWattage || null;
    if (solarPanelQuantity !== undefined) updateData.solarPanelQuantity = solarPanelQuantity ? parseInt(solarPanelQuantity) : null;
    if (monitoringPlatformUrl !== undefined) updateData.monitoringPlatformUrl = monitoringPlatformUrl || null;

    const system = await prisma.solarSystem.update({
      where: { id },
      data: updateData,
    });

    res.json(system);
  } catch (error: any) {
    console.error('Error updating system:', error);
    res.status(500).json({ error: 'Failed to update system' });
  }
});

// DELETE /api/bulk-systems/system/:id - Delete a solar system
router.delete('/system/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.solarSystem.delete({
      where: { id },
    });

    res.json({ message: 'System deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting system:', error);
    res.status(500).json({ error: 'Failed to delete system' });
  }
});

// POST /api/bulk-systems/user - Create a new user
router.post('/user', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      province,
      postalCode,
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'firstName, lastName, email, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Create user with default password
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('Welcome123!', 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: defaultPassword,
        role: 'CLIENT',
        streetAddress: streetAddress || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        latitude: latitude || null,
        longitude: longitude || null,
        formattedAddress: formattedAddress || null,
      },
      include: {
        solarSystems: true,
      },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/bulk-systems/user/:id - Update user details
router.put('/user/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      province,
      postalCode,
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (formattedAddress !== undefined) updateData.formattedAddress = formattedAddress;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        solarSystems: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/bulk-systems/user/:id - Delete a user and all their data
router.delete('/user/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prisma cascade delete will handle related records (solarSystems, bookings, payments)
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/bulk-systems/user/:id/reset-password - Reset user password to default
router.post('/user/:id/reset-password', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('Welcome123!', 10);

    await prisma.user.update({
      where: { id },
      data: { password: defaultPassword },
    });

    res.json({ message: 'Password reset to default (Welcome123!)' });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/bulk-systems/system/:id/components - Get components for a system
router.get('/system/:id/components', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const components = await prisma.systemComponent.findMany({
      where: { solarSystemId: id },
      orderBy: { componentType: 'asc' },
    });

    res.json(components);
  } catch (error: any) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// PUT /api/bulk-systems/system/:id/components - Update all components for a system
router.put('/system/:id/components', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { components } = req.body;

    if (!Array.isArray(components)) {
      return res.status(400).json({ error: 'Components must be an array' });
    }

    // Delete existing components for this system
    await prisma.systemComponent.deleteMany({
      where: { solarSystemId: id },
    });

    // Create new components
    const createdComponents = await Promise.all(
      components.map((component: any) =>
        prisma.systemComponent.create({
          data: {
            solarSystemId: id,
            componentType: component.componentType,
            manufacturer: component.manufacturer || '',
            model: component.model || '',
            serialNumber: component.serialNumber || null,
            installDate: component.installDate ? new Date(component.installDate) : new Date(),
            warrantyExpiry: component.warrantyExpiry ? new Date(component.warrantyExpiry) : null,
            notes: component.notes || null,
          },
        })
      )
    );

    res.json(createdComponents);
  } catch (error: any) {
    console.error('Error updating components:', error);
    res.status(500).json({ error: 'Failed to update components' });
  }
});

export default router;
