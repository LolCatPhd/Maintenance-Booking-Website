import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/bookings');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your booking has been confirmed.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to your bookings in 5 seconds...
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="btn-primary mt-6"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
