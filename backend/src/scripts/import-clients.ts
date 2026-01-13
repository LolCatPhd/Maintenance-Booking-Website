import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ClientRecord {
  name: string;
  contact: string;
  email: string;
  address: string;
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

      // Extract address components
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

// Parse CSV file - properly handles quoted fields and commas
function parseCSV(filePath: string): ClientRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const records: ClientRecord[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV properly: split by comma, but respect quoted fields
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
    fields.push(currentField.trim()); // Add last field

    // CSV columns: Filename,Client Name,Invoice/Quote Numbers,Document Type,Date,Total,Status,Contact,Email,Address
    // Indices:      0        1          2                      3            4    5     6      7       8     9
    if (fields.length < 10) continue;

    const clientName = fields[1] || '';
    const contact = fields[7] || '';
    const email = fields[8] || '';
    const address = fields[9] || '';

    // Skip if no client name or contact
    if (!clientName || !contact || clientName === 'MOH') {
      continue;
    }

    records.push({
      name: clientName,
      contact: contact.replace(/\s/g, ''), // Remove spaces from phone
      email: email || '',
      address: address || '',
    });
  }

  return records;
}

// Normalize phone number
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // If starts with 27, remove it (South Africa country code)
  if (normalized.startsWith('27')) {
    normalized = '0' + normalized.substring(2);
  }

  // If starts with 0, keep it
  // If doesn't start with 0, add it
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

async function importClients() {
  // In Railway: __dirname = /app/backend/src/scripts, CSV at /app/backend/complete_invoice_database_FINAL.csv
  // In local: __dirname = /path/to/backend/src/scripts, CSV at /path/to/backend/complete_invoice_database_FINAL.csv
  const csvPath = path.join(__dirname, '../../complete_invoice_database_FINAL.csv');
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN || '';

  if (!mapboxToken) {
    console.error('VITE_MAPBOX_TOKEN is not set in environment variables');
    process.exit(1);
  }

  console.log('Reading CSV file...');
  const records = parseCSV(csvPath);
  console.log(`Found ${records.length} records in CSV`);

  // Remove duplicates based on phone number
  const uniqueRecords = new Map<string, ClientRecord>();
  for (const record of records) {
    const normalizedPhone = normalizePhone(record.contact);
    if (!uniqueRecords.has(normalizedPhone)) {
      uniqueRecords.set(normalizedPhone, {
        ...record,
        contact: normalizedPhone,
      });
    }
  }

  console.log(`Found ${uniqueRecords.size} unique clients after deduplication`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const [phone, record] of uniqueRecords) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: phone },
            { email: record.email && record.email !== '' ? record.email : undefined },
          ],
        },
      });

      if (existingUser) {
        console.log(`Skipping ${record.name} (${phone}) - already exists`);
        skipped++;
        continue;
      }

      // Generate email if not provided
      const email = record.email && record.email !== ''
        ? record.email
        : `${generateUsername(record.name, phone)}@placeholder.local`;

      // Generate username
      const username = generateUsername(record.name, phone);

      // Hash password (use phone number)
      const hashedPassword = await bcrypt.hash(phone, 10);

      // Geocode address
      let locationData = null;
      if (record.address && record.address !== '') {
        console.log(`Geocoding address for ${record.name}: ${record.address}`);
        locationData = await geocodeAddress(record.address, mapboxToken);

        // Rate limit: wait 100ms between geocoding requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Extract first and last name
      const nameParts = record.name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Client';

      // Create user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'CLIENT',
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
          formattedAddress: locationData?.formattedAddress || record.address,
          streetAddress: locationData?.streetAddress,
          city: locationData?.city,
          province: locationData?.province,
          postalCode: locationData?.postalCode,
        },
      });

      console.log(`✓ Imported ${record.name} (${phone}) - Username: ${username}`);
      imported++;
    } catch (error) {
      console.error(`✗ Error importing ${record.name} (${phone}):`, error);
      errors++;
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total records in CSV: ${records.length}`);
  console.log(`Unique clients: ${uniqueRecords.size}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);

  await prisma.$disconnect();
}

// Run the import
importClients()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
