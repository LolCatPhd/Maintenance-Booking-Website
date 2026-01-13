import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface ParsedCommand {
  action: string;
  parameters: any;
}

router.post('/execute', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Parse the command using Gemini
    const parsedCommand = await parseCommand(command);

    // Execute the parsed command
    const result = await executeCommand(parsedCommand);

    res.json({
      success: true,
      command: parsedCommand,
      result,
    });
  } catch (error: any) {
    console.error('AI Command Error:', error);
    res.status(500).json({
      error: 'Failed to execute command',
      details: error.message,
    });
  }
});

async function parseCommand(command: string): Promise<ParsedCommand> {
  // Use pattern matching as fallback (more reliable than external API)
  const cmd = command.toLowerCase().trim();

  // Pattern: "add/create slots on [day] for [number] weeks"
  const dayWeekPattern = /(add|create).*slots?.*(on|every)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday).*(?:for|next)\s+(\d+)\s+weeks?/i;
  const dayWeekMatch = cmd.match(dayWeekPattern);

  if (dayWeekMatch) {
    const dayName = dayWeekMatch[3].toLowerCase();
    const weeksCount = parseInt(dayWeekMatch[4]);

    // Check for max bookings
    const maxBookingsPattern = /(?:max|maximum)\s+(\d+)\s+bookings?/i;
    const maxBookingsMatch = cmd.match(maxBookingsPattern);
    const maxBookings = maxBookingsMatch ? parseInt(maxBookingsMatch[1]) : 4;

    const dayMap: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    return {
      action: 'create_slots',
      parameters: {
        dayOfWeek: dayMap[dayName],
        weeksCount,
        maxBookings
      }
    };
  }

  // Pattern: "delete slots from [date] to [date]"
  const deletePattern = /delete.*slots?.*(from|between)\s+(\S+)\s+(?:to|and)\s+(\S+)/i;
  const deleteMatch = cmd.match(deletePattern);

  if (deleteMatch) {
    return {
      action: 'delete_slots',
      parameters: {
        startDate: deleteMatch[2],
        endDate: deleteMatch[3]
      }
    };
  }

  throw new Error(
    'Could not parse command. Try: "add availability slots on wednesday for the next 5 weeks" or "create slots every friday for 3 weeks with max 6 bookings"'
  );
}

async function executeCommand(parsedCommand: ParsedCommand): Promise<any> {
  const { action, parameters } = parsedCommand;

  switch (action) {
    case 'create_slots':
      return await createSlots(parameters);

    case 'delete_slots':
      return await deleteSlots(parameters);

    case 'update_slot_status':
      return await updateSlotStatus(parameters);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function createSlots(params: any) {
  const { dayOfWeek, weeksCount, maxBookings = 4, startDate, endDate } = params;

  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dayOfWeek !== undefined && weeksCount) {
    // Create slots for specific day of week for X weeks
    for (let week = 0; week < weeksCount; week++) {
      const date = new Date(today);

      // Find next occurrence of dayOfWeek
      const daysUntilTarget = (dayOfWeek - date.getDay() + 7) % 7;
      date.setDate(date.getDate() + daysUntilTarget + (week * 7));

      const slot = await prisma.availableSlot.create({
        data: {
          date,
          maxBookings,
          isAvailable: true,
        },
      });

      slots.push(slot);
    }
  } else if (startDate && endDate) {
    // Create slots for date range (existing bulk functionality)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const slot = await prisma.availableSlot.create({
        data: {
          date: new Date(currentDate),
          maxBookings,
          isAvailable: true,
        },
      });

      slots.push(slot);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    throw new Error('Invalid parameters for create_slots');
  }

  return {
    message: `Created ${slots.length} availability slots`,
    slots: slots.map((s) => ({
      id: s.id,
      date: s.date,
      maxBookings: s.maxBookings,
    })),
  };
}

async function deleteSlots(params: any) {
  const { startDate, endDate } = params;

  const deleted = await prisma.availableSlot.deleteMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  return {
    message: `Deleted ${deleted.count} slots`,
    count: deleted.count,
  };
}

async function updateSlotStatus(params: any) {
  const { slotId, isAvailable } = params;

  const slot = await prisma.availableSlot.update({
    where: { id: slotId },
    data: { isAvailable },
  });

  return {
    message: `Slot ${slotId} updated to ${isAvailable ? 'available' : 'unavailable'}`,
    slot,
  };
}

export default router;
