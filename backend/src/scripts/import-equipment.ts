import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface EquipmentRecord {
  clientName: string;
  contact: string;
  address: string;
  inverterModel: string;
  batteryModel: string;
  batteryQuantity: string;
  solarPanelWattage: string;
  solarPanelQuantity: string;
  invoiceNumber: string;
}

// Parse CSV file - properly handles quoted fields and commas
function parseCSV(filePath: string): EquipmentRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const records: EquipmentRecord[] = [];

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

    // CSV columns: Filename,Client Name,Invoice/Quote Numbers,Document Type,Date,Total,Status,Contact,Email,Address,Inverter,Battery,Battery Qty,Solar Panel,Solar Panel Qty
    // Indices:      0        1          2                      3            4    5     6      7       8     9       10       11      12           13           14
    if (fields.length < 15) continue;

    const clientName = fields[1] || '';
    const contact = fields[7] || '';
    const address = fields[9] || '';
    const inverter = fields[10] || '';
    const battery = fields[11] || '';
    const batteryQty = fields[12] || '';
    const solarPanel = fields[13] || '';
    const solarPanelQty = fields[14] || '';
    const invoiceNumber = fields[2] || '';

    // Skip if no client name or contact
    if (!clientName || !contact || clientName === 'MOH') {
      continue;
    }

    // Skip if no equipment data at all
    if (!inverter && !battery && !solarPanel) {
      continue;
    }

    records.push({
      clientName,
      contact: contact.replace(/\s/g, ''), // Remove spaces from phone
      address: address || '',
      inverterModel: inverter,
      batteryModel: battery,
      batteryQuantity: batteryQty,
      solarPanelWattage: solarPanel,
      solarPanelQuantity: solarPanelQty,
      invoiceNumber,
    });
  }

  return records;
}

// Normalize phone number
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

async function importEquipment() {
  const csvPath = path.join(__dirname, '../../complete_invoice_database_with_equipment.csv');

  console.log('Reading equipment CSV file...');
  const records = parseCSV(csvPath);

  console.log(`Found ${records.length} equipment records in CSV`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Group records by phone number to handle multiple systems per client
  const recordsByPhone = new Map<string, EquipmentRecord[]>();

  for (const record of records) {
    const phone = normalizePhone(record.contact);
    if (!recordsByPhone.has(phone)) {
      recordsByPhone.set(phone, []);
    }
    recordsByPhone.get(phone)!.push(record);
  }

  console.log(`Processing ${recordsByPhone.size} unique clients with equipment data...`);
  console.log('');

  for (const [phone, clientRecords] of recordsByPhone) {
    const firstRecord = clientRecords[0];

    try {
      // Find the user by phone number
      const user = await prisma.user.findFirst({
        where: { phone: phone },
        include: { solarSystems: true },
      });

      if (!user) {
        console.log(`⚠️  User not found for phone: ${phone} (${firstRecord.clientName})`);
        skipCount++;
        continue;
      }

      // Create a solar system for each equipment record
      for (let i = 0; i < clientRecords.length; i++) {
        const record = clientRecords[i];
        const systemNumber = user.solarSystems.length + i + 1;
        const systemName = record.invoiceNumber
          ? `System ${systemNumber} (${record.invoiceNumber.split(',')[0].trim()})`
          : `System ${systemNumber}`;

        const systemData = {
          userId: user.id,
          systemName,
          installationDate: new Date(), // Default to today, can be updated via bulk editor
          address: record.address || user.formattedAddress || user.city || 'Unknown',
          inverterModel: record.inverterModel || null,
          batteryModel: record.batteryModel || null,
          batteryQuantity: record.batteryQuantity ? parseInt(record.batteryQuantity) : null,
          solarPanelWattage: record.solarPanelWattage || null,
          solarPanelQuantity: record.solarPanelQuantity ? parseInt(record.solarPanelQuantity) : null,
        };

        await prisma.solarSystem.create({
          data: systemData,
        });

        console.log(`✓ Created ${systemName} for ${firstRecord.clientName} (${phone})`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`✗ Error processing ${firstRecord.clientName} (${phone}):`, error.message);
      errorCount++;
    }
  }

  console.log('');
  console.log('=== Equipment Import Summary ===');
  console.log(`Total equipment records: ${records.length}`);
  console.log(`Unique clients: ${recordsByPhone.size}`);
  console.log(`Successfully imported systems: ${successCount}`);
  console.log(`Skipped (user not found): ${skipCount}`);
  console.log(`Errors: ${errorCount}`);

  await prisma.$disconnect();
}

importEquipment().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
