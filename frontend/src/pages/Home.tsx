import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Professional Solar Maintenance Services
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Keep your solar system running at peak performance with our expert
              maintenance services. Easy booking, transparent pricing, and quality service.
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link to="/book" className="bg-solar-yellow text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition">
                  Book Maintenance Now
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-solar-yellow text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition">
                    Get Started
                  </Link>
                  <Link to="/login" className="bg-white text-solar-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-solar-blue text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Routine Inspection</h3>
              <p className="text-gray-600">
                Comprehensive system checks to ensure optimal performance
              </p>
              <p className="text-2xl font-bold text-solar-blue mt-4">$150</p>
            </div>
            <div className="card text-center">
              <div className="text-solar-blue text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Panel Cleaning</h3>
              <p className="text-gray-600">
                Professional cleaning to maximize energy production
              </p>
              <p className="text-2xl font-bold text-solar-blue mt-4">$200</p>
            </div>
            <div className="card text-center">
              <div className="text-solar-blue text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Full Maintenance</h3>
              <p className="text-gray-600">
                Complete service package for your solar system
              </p>
              <p className="text-2xl font-bold text-solar-blue mt-4">$400</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-solar-yellow text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Easy Online Booking</h3>
                <p className="text-gray-600">
                  Book your maintenance appointment in minutes with our simple calendar system
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-solar-yellow text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  Multiple payment options including credit card and EFT
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-solar-yellow text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Track Your System</h3>
                <p className="text-gray-600">
                  View your system components and maintenance history in one place
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-solar-yellow text-3xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Professional Service</h3>
                <p className="text-gray-600">
                  Certified technicians with years of solar system experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
