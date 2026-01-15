import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRecord {
  filename: string;
  clientName: string;
  invoiceNumbers: string;
  documentType: string;
  date: string;
  total: string;
  status: string;
  contact: string;
  email: string;
  address: string;
  inverter: string;
  battery: string;
  batteryQty: string;
  solarPanel: string;
  solarPanelQty: string;
}

interface MapboxFeature {
  center: [number, number];
  place_name: string;
  text: string;
  address?: string;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

// Mapbox geocoding function
async function geocodeAddress(address: string, mapboxToken: string) {
  if (!address || address.trim() === '') {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address + ', South Africa');
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${mapboxToken}&` +
      `country=ZA&` +
      `types=address,place&` +
      `limit=1`
    );

    const data = (await response.json()) as MapboxResponse;

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      const context = feature.context || [];
      let city = null;
      let province = null;
      let postalCode = null;

      for (const item of context) {
        if (item.id.startsWith('place.')) {
          city = item.text;
        } else if (item.id.startsWith('region.')) {
          province = item.text;
        } else if (item.id.startsWith('postcode.')) {
          postalCode = item.text;
        }
      }

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        streetAddress: feature.address ? `${feature.address} ${feature.text}` : feature.text,
        city,
        province,
        postalCode,
      };
    }

    return null;
  } catch (error) {
    console.error(`Geocoding failed for address: ${address}`, error);
    return null;
  }
}

// Parse CSV file
function parseCSV(filePath: string): CSVRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const records: CSVRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields: string[] = [];
    let currentField = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());

    // CSV columns: Filename, Client Name, Invoice/Quote Numbers, Document Type, Date, Total, Status, Contact, Email, Address, Inverter, Battery, Battery Qty, Solar Panel, Solar Panel Qty
    if (fields.length < 15) continue;

    const clientName = fields[1] || '';
    const contact = fields[7] || '';

    // Skip if no client name or invalid entries
    if (!clientName || !contact || clientName === 'MOH' || clientName.trim() === '') {
      continue;
    }

    records.push({
      filename: fields[0] || '',
      clientName,
      invoiceNumbers: fields[2] || '',
      documentType: fields[3] || '',
      date: fields[4] || '',
      total: fields[5] || '',
      status: fields[6] || '',
      contact: contact.replace(/\s/g, ''),
      email: fields[8] || '',
      address: fields[9] || '',
      inverter: fields[10] || '',
      battery: fields[11] || '',
      batteryQty: fields[12] || '',
      solarPanel: fields[13] || '',
      solarPanelQty: fields[14] || '',
    });
  }

  return records;
}

// Normalize phone number
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/\D/g, '');

  if (normalized.startsWith('27')) {
    normalized = '0' + normalized.substring(2);
  }

  if (!normalized.startsWith('0')) {
    normalized = '0' + normalized;
  }

  return normalized;
}

// Generate username
function generateUsername(name: string, contact: string): string {
  const firstName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '');
  const phone = contact.replace(/\D/g, '');
  return `${firstName}${phone}`.toLowerCase();
}

async function importDatabase() {
  const csvPath = path.join(__dirname, '../../complete_invoice_database_updated.csv');
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN || '';

  if (!mapboxToken) {
    console.error('VITE_MAPBOX_TOKEN is not set in environment variables');
    process.exit(1);
  }

  console.log('Reading CSV file...');
  const records = parseCSV(csvPath);
  console.log(`Found ${records.length} records in CSV\n`);

  // Group records by phone number
  const recordsByPhone = new Map<string, CSVRecord[]>();
  for (const record of records) {
    const phone = normalizePhone(record.contact);
    if (!recordsByPhone.has(phone)) {
      recordsByPhone.set(phone, []);
    }
    recordsByPhone.get(phone)!.push(record);
  }

  console.log(`Found ${recordsByPhone.size} unique clients\n`);

  const stats = {
    usersCreated: 0,
    usersUpdated: 0,
    usersSkipped: 0,
    systemsCreated: 0,
    componentsCreated: 0,
    errors: 0,
  };

  for (const [phone, clientRecords] of recordsByPhone) {
    const firstRecord = clientRecords[0];

    try {
      // Extract name
      const nameParts = firstRecord.clientName.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Client';

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: { phone: phone },
      });

      if (!user && firstRecord.email && firstRecord.email !== '') {
        user = await prisma.user.findUnique({
          where: { email: firstRecord.email },
        });
      }

      // Create or update user
      if (!user) {
        const email = firstRecord.email && firstRecord.email !== ''
          ? firstRecord.email
          : `${generateUsername(firstRecord.clientName, phone)}@placeholder.local`;

        const hashedPassword = await bcrypt.hash('Welcome123!', 10);

        // Geocode address
        let locationData = null;
        if (firstRecord.address && firstRecord.address !== '') {
          console.log(`  Geocoding address for ${firstRecord.clientName}: ${firstRecord.address}`);
          locationData = await geocodeAddress(firstRecord.address, mapboxToken);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: 'CLIENT',
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            formattedAddress: locationData?.formattedAddress || firstRecord.address,
            streetAddress: locationData?.streetAddress || firstRecord.address,
            city: locationData?.city,
            province: locationData?.province,
            postalCode: locationData?.postalCode,
          },
        });

        console.log(`✓ Created user: ${firstRecord.clientName} (${phone})`);
        stats.usersCreated++;
      } else {
        console.log(`→ User exists: ${firstRecord.clientName} (${phone})`);
        stats.usersSkipped++;
      }

      // Create solar systems with components
      for (let i = 0; i < clientRecords.length; i++) {
        const record = clientRecords[i];

        // Skip if no equipment data
        if (!record.inverter && !record.battery && !record.solarPanel) {
          continue;
        }

        // Get existing systems count
        const existingSystemsCount = await prisma.solarSystem.count({
          where: { userId: user.id },
        });

        const systemNumber = existingSystemsCount + 1;
        const invoiceRef = record.invoiceNumbers ? record.invoiceNumbers.split(',')[0].trim() : '';
        const systemName = invoiceRef
          ? `System ${systemNumber} (${invoiceRef})`
          : `System ${systemNumber}`;

        // Create solar system
        const solarSystem = await prisma.solarSystem.create({
          data: {
            userId: user.id,
            systemName,
            installationDate: new Date(),
            address: record.address || user.formattedAddress || user.city || 'Unknown',
          },
        });

        console.log(`  ✓ Created ${systemName}`);
        stats.systemsCreated++;

        // Create components
        const components = [];

        // Inverter
        if (record.inverter && record.inverter.trim() !== '') {
          const inverterParts = record.inverter.trim().split(' ');
          const manufacturer = inverterParts[0] || 'Unknown';
          const model = inverterParts.slice(1).join(' ') || record.inverter;

          components.push({
            componentType: 'INVERTER',
            manufacturer,
            model,
          });
        }

        // Batteries
        if (record.battery && record.battery.trim() !== '') {
          const batteryQty = parseInt(record.batteryQty) || 1;
          const batteryParts = record.battery.trim().split(' ');
          const manufacturer = batteryParts[0] || 'Unknown';
          const model = batteryParts.slice(1).join(' ') || record.battery;

          for (let j = 0; j < batteryQty; j++) {
            components.push({
              componentType: 'BATTERY',
              manufacturer,
              model,
            });
          }
        }

        // Solar Panels
        if (record.solarPanel && record.solarPanel.trim() !== '') {
          const panelQty = parseInt(record.solarPanelQty) || 1;
          const panelParts = record.solarPanel.trim().split(' ');
          const manufacturer = panelParts[0] || 'Unknown';
          const model = panelParts.slice(1).join(' ') || record.solarPanel;

          for (let j = 0; j < panelQty; j++) {
            components.push({
              componentType: 'SOLAR_PANEL',
              manufacturer,
              model,
            });
          }
        }

        // Create all components
        if (components.length > 0) {
          await prisma.systemComponent.createMany({
            data: components.map(comp => ({
              solarSystemId: solarSystem.id,
              ...comp,
              installDate: new Date(),
            })),
          });

          console.log(`    Added ${components.length} components`);
          stats.componentsCreated += components.length;
        }
      }

      console.log('');
    } catch (error: any) {
      console.error(`✗ Error processing ${firstRecord.clientName} (${phone}):`, error.message);
      stats.errors++;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total records in CSV: ${records.length}`);
  console.log(`Unique clients: ${recordsByPhone.size}`);
  console.log(`Users created: ${stats.usersCreated}`);
  console.log(`Users already existed: ${stats.usersSkipped}`);
  console.log(`Solar systems created: ${stats.systemsCreated}`);
  console.log(`Components created: ${stats.componentsCreated}`);
  console.log(`Errors: ${stats.errors}`);

  await prisma.$disconnect();
}

importDatabase().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
