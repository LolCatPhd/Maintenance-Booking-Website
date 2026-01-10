import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingAPI, paymentAPI } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ booking, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'EFT'>('CREDIT_CARD');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (paymentMethod === 'CREDIT_CARD') {
      loadPaymentIntent();
    }
  }, [paymentMethod]);

  const loadPaymentIntent = async () => {
    try {
      const response = await paymentAPI.createPaymentIntent(booking.id, paymentMethod);
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      setError('Failed to initialize payment');
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card information is incomplete');
      setProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        await paymentAPI.confirmPayment(booking.id, paymentIntent.id);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleEFTPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await paymentAPI.createPaymentIntent(booking.id, 'EFT');
      alert(
        'EFT payment initiated. Please transfer the amount to our bank account. Your booking will be confirmed once payment is received.'
      );
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process EFT payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Select Payment Method</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="CREDIT_CARD"
              checked={paymentMethod === 'CREDIT_CARD'}
              onChange={() => setPaymentMethod('CREDIT_CARD')}
              className="w-4 h-4"
            />
            <span className="text-lg">Credit Card</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="EFT"
              checked={paymentMethod === 'EFT'}
              onChange={() => setPaymentMethod('EFT')}
              className="w-4 h-4"
            />
            <span className="text-lg">EFT / Bank Transfer</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {paymentMethod === 'CREDIT_CARD' ? (
        <form onSubmit={handleCardPayment}>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Card Information</h3>
            <div className="p-4 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="w-full btn-primary mt-4 disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay $${booking.totalAmount}`}
          </button>
        </form>
      ) : (
        <form onSubmit={handleEFTPayment}>
          <div className="card bg-blue-50">
            <h3 className="text-xl font-bold mb-4">Bank Transfer Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Bank:</strong> Solar Bank
              </p>
              <p>
                <strong>Account Name:</strong> Solar Maintenance Services
              </p>
              <p>
                <strong>Account Number:</strong> 1234567890
              </p>
              <p>
                <strong>Reference:</strong> {booking.id.substring(0, 8).toUpperCase()}
              </p>
              <p className="text-lg font-bold text-solar-blue mt-4">
                Amount: ${booking.totalAmount}
              </p>
            </div>
          </div>
          <button type="submit" disabled={processing} className="w-full btn-primary mt-4">
            {processing ? 'Processing...' : 'Confirm EFT Payment'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await bookingAPI.getBooking(bookingId!);
      setBooking(response.data);
    } catch (error) {
      alert('Failed to load booking');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    alert('Payment successful!');
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Complete Payment</h1>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
          <div className="space-y-2">
            <p>
              <strong>Service:</strong> {booking.serviceType.replace(/_/g, ' ')}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(booking.slot.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p>
              <strong>Address:</strong> {booking.address}
            </p>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="text-2xl font-bold text-solar-blue">
                Total: ${booking.totalAmount}
              </p>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
}
