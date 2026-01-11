import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import BookingForm from './pages/BookingForm';
import SolarSystems from './pages/SolarSystems';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import AdminDashboard from './pages/AdminDashboard';
import DesignTool from './pages/DesignTool';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
          <Route
            path="dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="bookings"
            element={user ? <Bookings /> : <Navigate to="/login" />}
          />
          <Route
            path="book"
            element={user ? <BookingForm /> : <Navigate to="/login" />}
          />
          <Route
            path="solar-systems"
            element={user ? <SolarSystems /> : <Navigate to="/login" />}
          />
          <Route
            path="design-tool"
            element={user ? <DesignTool /> : <Navigate to="/login" />}
          />
          <Route
            path="payment/:bookingId"
            element={user ? <Payment /> : <Navigate to="/login" />}
          />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/cancel" element={<PaymentCancel />} />
          <Route
            path="admin"
            element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/dashboard" />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
