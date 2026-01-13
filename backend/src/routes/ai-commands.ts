import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Gemini - using free tier
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ParsedCommand {
  action: string;
  parameters: any;
}

router.post('/execute', authenticateAdmin, async (req, res) => {
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
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a command parser for an admin booking system. Parse the following natural language command into a structured JSON format.

Available actions:
- "create_slots": Create availability slots with parameters: { dayOfWeek, startDate, endDate, weeksCount, maxBookings }
- "delete_slots": Delete slots with parameters: { startDate, endDate }
- "update_slot_status": Update slot availability with parameters: { slotId, isAvailable }

Command: "${command}"

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "action": "action_name",
  "parameters": { /* relevant parameters */ }
}

For date calculations:
- "next 5 weeks" means starting from today
- "wednesday" or day names should be in dayOfWeek parameter (0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, etc.)
- maxBookings defaults to 4 if not specified
- Always use YYYY-MM-DD format for dates

Examples:
"add availability slots on wednesday for the next 5 weeks"
{"action":"create_slots","parameters":{"dayOfWeek":3,"weeksCount":5,"maxBookings":4}}

"create slots every friday for 3 weeks with max 6 bookings"
{"action":"create_slots","parameters":{"dayOfWeek":5,"weeksCount":3,"maxBookings":6}}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Clean up the response to extract JSON
  let jsonStr = response.trim();
  // Remove markdown code blocks if present
  jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${response}`);
  }
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

      const slot = await prisma.availabilitySlot.create({
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
      const slot = await prisma.availabilitySlot.create({
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

  const deleted = await prisma.availabilitySlot.deleteMany({
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

  const slot = await prisma.availabilitySlot.update({
    where: { id: slotId },
    data: { isAvailable },
  });

  return {
    message: `Slot ${slotId} updated to ${isAvailable ? 'available' : 'unavailable'}`,
    slot,
  };
}

export default router;
