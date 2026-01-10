import express from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const createPaymentIntentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['CREDIT_CARD', 'EFT', 'BANK_TRANSFER']),
});

router.post('/create-intent', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createPaymentIntentSchema.parse(req.body);

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        userId: req.userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingPayment && existingPayment.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    let paymentIntent;
    if (data.paymentMethod === 'CREDIT_CARD') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100),
        currency: 'usd',
        metadata: {
          bookingId: booking.id,
          userId: req.userId!,
        },
      });
    }

    const payment = await prisma.payment.upsert({
      where: { bookingId: data.bookingId },
      update: {
        paymentMethod: data.paymentMethod,
        stripePaymentId: paymentIntent?.id,
      },
      create: {
        bookingId: data.bookingId,
        userId: req.userId!,
        amount: booking.totalAmount,
        paymentMethod: data.paymentMethod,
        stripePaymentId: paymentIntent?.id,
        paymentStatus: 'PENDING',
      },
    });

    res.json({
      payment,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/confirm', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookingId, transactionRef } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        bookingId,
        userId: req.userId,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus: 'COMPLETED',
        transactionRef,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.userId },
      include: {
        booking: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

export default router;
