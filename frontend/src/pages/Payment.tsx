import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../services/api';

function PayFastPaymentForm({ paymentData, payFastUrl }: any) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current && paymentData) {
      formRef.current.submit();
    }
  }, [paymentData]);

  if (!paymentData) return null;

  return (
    <form ref={formRef} action={payFastUrl} method="POST">
      {Object.entries(paymentData).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value as string} />
      ))}
    </form>
  );
}

function CheckoutForm({ booking, onSuccess }: any) {
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'EFT'>('CREDIT_CARD');
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [payFastData, setPayFastData] = useState<any>(null);
  const [payFastUrl, setPayFastUrl] = useState('');

  const handlePayFastPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await paymentAPI.createPayment(booking.id, 'CREDIT_CARD');

      if (response.data.paymentMethod === 'PAYFAST') {
        setPayFastData(response.data.payFastData);
        setPayFastUrl(response.data.payFastUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
      setProcessing(false);
    }
  };

  const handleEFTPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await paymentAPI.createPayment(booking.id, 'EFT');
      setBankDetails(response.data.bankDetails);
      setProcessing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process EFT payment');
      setProcessing(false);
    }
  };

  const handleConfirmEFT = async () => {
    try {
      await paymentAPI.confirmPayment(booking.id);
      alert('Thank you! We will confirm your payment once we receive the transfer.');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm payment');
    }
  };

  return (
    <div className="space-y-6">
      {payFastData && payFastUrl && (
        <PayFastPaymentForm paymentData={payFastData} payFastUrl={payFastUrl} />
      )}

      {!bankDetails && !payFastData && (
        <>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-solar-blue transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CREDIT_CARD"
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={() => setPaymentMethod('CREDIT_CARD')}
                  className="w-4 h-4 text-solar-blue"
                />
                <div>
                  <span className="text-lg font-semibold">Credit/Debit Card</span>
                  <p className="text-sm text-gray-600">Secure payment via PayFast</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-solar-blue transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="EFT"
                  checked={paymentMethod === 'EFT'}
                  onChange={() => setPaymentMethod('EFT')}
                  className="w-4 h-4 text-solar-blue"
                />
                <div>
                  <span className="text-lg font-semibold">EFT / Bank Transfer</span>
                  <p className="text-sm text-gray-600">Direct bank deposit</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {paymentMethod === 'CREDIT_CARD' ? (
            <form onSubmit={handlePayFastPayment}>
              <div className="card bg-blue-50">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold">Secure Payment</h3>
                    <p className="text-sm text-gray-600">You'll be redirected to PayFast to complete payment</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>What to expect:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>You'll be securely redirected to PayFast</li>
                    <li>Enter your card details on PayFast's secure page</li>
                    <li>Complete the payment</li>
                    <li>You'll be redirected back to our site</li>
                  </ul>
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary mt-4 disabled:opacity-50"
              >
                {processing ? 'Redirecting to PayFast...' : `Pay R${booking.totalAmount} with PayFast`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEFTPayment}>
              <div className="card bg-blue-50">
                <h3 className="text-xl font-bold mb-4">EFT Payment Instructions</h3>
                <p className="text-gray-700 mb-4">
                  Click below to get our bank details. Once you've made the transfer, click confirm.
                </p>
              </div>
              <button type="submit" disabled={processing} className="w-full btn-primary mt-4">
                {processing ? 'Processing...' : 'Get Bank Details'}
              </button>
            </form>
          )}
        </>
      )}

      {bankDetails && (
        <div className="card bg-green-50 border-2 border-green-300">
          <h3 className="text-2xl font-bold mb-4 text-green-800">Bank Transfer Details</h3>
          <div className="bg-white p-6 rounded-lg space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bank</p>
                <p className="text-lg font-bold">{bankDetails.bank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch Code</p>
                <p className="text-lg font-bold">{bankDetails.branchCode}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Name</p>
              <p className="text-lg font-bold">{bankDetails.accountName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-lg font-bold">{bankDetails.accountNumber}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">Payment Reference (IMPORTANT)</p>
              <p className="text-xl font-bold text-solar-blue">{bankDetails.reference}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-600">Amount to Transfer</p>
              <p className="text-2xl font-bold text-green-600">R{booking.totalAmount}</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">Important:</p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Please use the reference number <strong>{bankDetails.reference}</strong> when making the payment</li>
              <li>Payment confirmation may take 1-2 business days</li>
              <li>We'll email you once payment is confirmed</li>
            </ul>
          </div>
          <button
            onClick={handleConfirmEFT}
            className="w-full btn-primary"
          >
            I've Made the Transfer
          </button>
        </div>
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Payment</h1>
        <p className="text-gray-600 mb-8">Secure payment for your solar maintenance service</p>

        <div className="card mb-8 bg-gradient-to-r from-blue-50 to-orange-50">
          <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold">{booking.serviceType.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date(booking.slot.date).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-semibold">{booking.address}</span>
            </div>
            <div className="pt-4 border-t border-gray-300 mt-4 flex justify-between items-center">
              <span className="text-xl font-bold">Total Amount:</span>
              <span className="text-3xl font-bold text-solar-blue">R{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
}
