import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-yellow-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You can try again or contact us if you need assistance.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate('/bookings')}
              className="btn-primary"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/book')}
              className="btn-secondary"
            >
              Make New Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
