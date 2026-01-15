import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check if user is admin
const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

interface CSVRow {
  'Filename': string;
  'Client Name': string;
  'Invoice/Quote Numbers': string;
  'Document Type': string;
  'Date': string;
  'Total': string;
  'Status': string;
  'Contact': string;
  'Email': string;
  'Address': string;
  'Inverter': string;
  'Battery': string;
  'Battery Qty': string;
  'Solar Panel': string;
  'Solar Panel Qty': string;
}

// POST /api/csv-import - Import CSV file
router.post('/', authenticateToken, requireAdmin, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');

    // Parse CSV
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      usersCreated: 0,
      usersUpdated: 0,
      systemsCreated: 0,
      componentsCreated: 0,
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      try {
        // Skip rows with no client name
        if (!row['Client Name'] || row['Client Name'].trim() === '') {
          continue;
        }

        const clientName = row['Client Name'].trim();
        const nameParts = clientName.split(' ');
        const firstName = nameParts[0] || clientName;
        const lastName = nameParts.slice(1).join(' ') || clientName;

        // Prepare user data
        const phone = row['Contact']?.trim() || '';
        const email = row['Email']?.trim() || '';
        const address = row['Address']?.trim() || '';

        // Try to find existing user by name or email
        let user = null;
        if (email) {
          user = await prisma.user.findUnique({
            where: { email },
          });
        }

        if (!user && phone) {
          user = await prisma.user.findFirst({
            where: { phone },
          });
        }

        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              AND: [
                { firstName: { equals: firstName, mode: 'insensitive' } },
                { lastName: { equals: lastName, mode: 'insensitive' } },
              ],
            },
          });
        }

        // Create or update user
        if (!user) {
          // Create new user with default password
          const bcrypt = require('bcryptjs');
          const defaultPassword = await bcrypt.hash('Welcome123!', 10);

          user = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@placeholder.com`,
              password: defaultPassword,
              phone: phone || 'N/A',
              streetAddress: address,
              role: 'CLIENT',
            },
          });
          results.usersCreated++;
        } else {
          // Update existing user if address or contact info is provided
          if (address || phone || email) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                ...(address && { streetAddress: address }),
                ...(phone && { phone }),
                ...(email && { email }),
              },
            });
            results.usersUpdated++;
          }
        }

        // Check if we have system components to create
        const hasInverter = row['Inverter']?.trim();
        const hasBattery = row['Battery']?.trim();
        const hasSolarPanel = row['Solar Panel']?.trim();

        if (hasInverter || hasBattery || hasSolarPanel) {
          // Create a solar system for this user
          const systemName = `${clientName}'s System`;

          // Check if user already has a system
          let solarSystem = await prisma.solarSystem.findFirst({
            where: {
              userId: user.id,
              systemName,
            },
          });

          if (!solarSystem) {
            solarSystem = await prisma.solarSystem.create({
              data: {
                userId: user.id,
                systemName,
                installationDate: new Date(),
                address: address || user.streetAddress || '',
              },
            });
            results.systemsCreated++;
          }

          // Create components
          const components = [];

          // Inverter
          if (hasInverter) {
            const inverterParts = hasInverter.split(' ');
            const manufacturer = inverterParts[0] || 'Unknown';
            const model = inverterParts.slice(1).join(' ') || hasInverter;

            components.push({
              componentType: 'INVERTER',
              manufacturer,
              model,
              installDate: new Date(),
            });
          }

          // Battery
          if (hasBattery) {
            const batteryQty = parseInt(row['Battery Qty']) || 1;
            const batteryParts = hasBattery.split(' ');
            const manufacturer = batteryParts[0] || 'Unknown';
            const model = batteryParts.slice(1).join(' ') || hasBattery;

            for (let j = 0; j < batteryQty; j++) {
              components.push({
                componentType: 'BATTERY',
                manufacturer,
                model,
                installDate: new Date(),
              });
            }
          }

          // Solar Panels
          if (hasSolarPanel) {
            const panelQty = parseInt(row['Solar Panel Qty']) || 1;
            const panelParts = hasSolarPanel.split(' ');
            const manufacturer = panelParts[0] || 'Unknown';
            const model = panelParts.slice(1).join(' ') || hasSolarPanel;

            for (let j = 0; j < panelQty; j++) {
              components.push({
                componentType: 'SOLAR_PANEL',
                manufacturer,
                model,
                installDate: new Date(),
              });
            }
          }

          // Delete existing components for this system
          await prisma.systemComponent.deleteMany({
            where: { solarSystemId: solarSystem.id },
          });

          // Create new components
          await prisma.systemComponent.createMany({
            data: components.map(comp => ({
              solarSystemId: solarSystem.id,
              ...comp,
            })),
          });

          results.componentsCreated += components.length;
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      message: 'Import completed',
      results,
    });
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Failed to import CSV', details: error.message });
  }
});

export default router;
