import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createPaymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['CREDIT_CARD', 'EFT', 'BANK_TRANSFER']),
});

// PayFast configuration
const getPayFastConfig = () => ({
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  sandbox: process.env.PAYFAST_SANDBOX === 'true',
  baseUrl: process.env.PAYFAST_SANDBOX === 'true'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process',
});

// Generate PayFast signature
function generatePayFastSignature(data: Record<string, any>, passphrase: string = ''): string {
  let pfParamString = '';

  // Sort the data
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {} as Record<string, any>);

  // Create parameter string
  for (const key in sortedData) {
    pfParamString += `${key}=${encodeURIComponent(sortedData[key].toString().trim()).replace(/%20/g, '+')}&`;
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  // Add passphrase if provided
  if (passphrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  // Generate signature
  return crypto.createHash('md5').update(pfParamString).digest('hex');
}

router.post('/create-payment', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createPaymentSchema.parse(req.body);

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        userId: req.userId,
      },
      include: {
        user: true,
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

    const config = getPayFastConfig();

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: data.bookingId },
      update: {
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
      },
      create: {
        bookingId: data.bookingId,
        userId: req.userId!,
        amount: booking.totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
      },
    });

    // For EFT/Bank Transfer, return bank details
    if (data.paymentMethod === 'EFT' || data.paymentMethod === 'BANK_TRANSFER') {
      return res.json({
        payment,
        paymentMethod: 'EFT',
        bankDetails: {
          bank: 'Standard Bank',
          accountName: 'Artisan Solar (Pty) Ltd',
          accountNumber: '123456789',
          branchCode: '051001',
          reference: `AS${booking.id.substring(0, 8).toUpperCase()}`,
        },
      });
    }

    // For PayFast payment
    const paymentData = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/notify`,
      name_first: booking.user.firstName,
      name_last: booking.user.lastName,
      email_address: booking.user.email,
      m_payment_id: payment.id,
      amount: booking.totalAmount.toFixed(2),
      item_name: `Artisan Solar - ${booking.serviceType.replace(/_/g, ' ')}`,
      item_description: `Solar maintenance booking for ${new Date(booking.createdAt).toLocaleDateString()}`,
    };

    const signature = generatePayFastSignature(paymentData, config.passphrase);

    res.json({
      payment,
      paymentMethod: 'PAYFAST',
      payFastUrl: config.baseUrl,
      payFastData: {
        ...paymentData,
        signature,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.post('/notify', async (req, res) => {
  try {
    const config = getPayFastConfig();
    const pfData = req.body;

    // Verify signature
    const signature = pfData.signature;
    delete pfData.signature;

    const calculatedSignature = generatePayFastSignature(pfData, config.passphrase);

    if (signature !== calculatedSignature) {
      console.error('Invalid PayFast signature');
      return res.status(400).send('Invalid signature');
    }

    // Update payment status
    const payment = await prisma.payment.findUnique({
      where: { id: pfData.m_payment_id },
    });

    if (!payment) {
      console.error('Payment not found:', pfData.m_payment_id);
      return res.status(404).send('Payment not found');
    }

    const paymentStatus = pfData.payment_status === 'COMPLETE' ? 'COMPLETED' : 'FAILED';

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        transactionRef: pfData.pf_payment_id,
      },
    });

    if (paymentStatus === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('Error processing notification');
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

router.get('/check-status/:paymentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: req.params.paymentId,
        userId: req.userId,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

export default router;
