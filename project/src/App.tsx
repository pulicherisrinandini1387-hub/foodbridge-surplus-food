import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/store/AppContext';
import { ToastProvider } from '@/components/ui/Toast';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from '@/pages/AuthPages';
import { DonorOverview } from '@/pages/donor/DonorOverview';
import { PostDonation } from '@/pages/donor/PostDonation';
import { MyDonations, ActiveDonations, PickupRequests } from '@/pages/donor/DonorDonations';
import { DonationFeed } from '@/pages/DonationFeed';
import { NgoOverview, MyClaims, FoodRequests, NgoDeliveries, NgoVolunteers } from '@/pages/ngo/NgoPages';
import { VolunteerTasks, ActiveTask, MyDeliveries, CompletedTasks } from '@/pages/volunteer/VolunteerPages';
import { ImpactDashboard } from '@/pages/ImpactDashboard';
import { AdminOverview, AdminUsers, AdminNgos, AdminDonations, AdminDeliveries, AdminVolunteers, AdminVerification, AdminReports } from '@/pages/admin/AdminPages';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage, ChatPage } from '@/pages/SharedPages';
import type { Role } from '@/types';

function RoleRedirect() {
  const { users, currentUserId } = useApp();
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: Role[] }) {
  const { users, currentUserId } = useApp();
  const user = users.find((u) => u.id === currentUserId);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/app" element={<RoleRedirect />} />

      {/* Donor routes */}
      <Route path="/donor" element={<ProtectedRoute roles={['donor']}><DonorOverview /></ProtectedRoute>} />
      <Route path="/donor/post" element={<ProtectedRoute roles={['donor']}><PostDonation /></ProtectedRoute>} />
      <Route path="/donor/my-donations" element={<ProtectedRoute roles={['donor']}><MyDonations /></ProtectedRoute>} />
      <Route path="/donor/active-donations" element={<ProtectedRoute roles={['donor']}><ActiveDonations /></ProtectedRoute>} />
      <Route path="/donor/pickup-requests" element={<ProtectedRoute roles={['donor']}><PickupRequests /></ProtectedRoute>} />
      <Route path="/donor/impact" element={<ProtectedRoute roles={['donor']}><ImpactDashboard /></ProtectedRoute>} />
      <Route path="/donor/notifications" element={<ProtectedRoute roles={['donor']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/donor/profile" element={<ProtectedRoute roles={['donor']}><ProfilePage /></ProtectedRoute>} />

      {/* NGO routes */}
      <Route path="/ngo" element={<ProtectedRoute roles={['ngo']}><NgoOverview /></ProtectedRoute>} />
      <Route path="/ngo/nearby-food" element={<ProtectedRoute roles={['ngo']}><DonationFeed role="ngo" /></ProtectedRoute>} />
      <Route path="/ngo/my-claims" element={<ProtectedRoute roles={['ngo']}><MyClaims /></ProtectedRoute>} />
      <Route path="/ngo/food-requests" element={<ProtectedRoute roles={['ngo']}><FoodRequests /></ProtectedRoute>} />
      <Route path="/ngo/deliveries" element={<ProtectedRoute roles={['ngo']}><NgoDeliveries /></ProtectedRoute>} />
      <Route path="/ngo/volunteers" element={<ProtectedRoute roles={['ngo']}><NgoVolunteers /></ProtectedRoute>} />
      <Route path="/ngo/impact" element={<ProtectedRoute roles={['ngo']}><ImpactDashboard /></ProtectedRoute>} />
      <Route path="/ngo/notifications" element={<ProtectedRoute roles={['ngo']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/ngo/profile" element={<ProtectedRoute roles={['ngo']}><ProfilePage /></ProtectedRoute>} />

      {/* Volunteer routes */}
      <Route path="/volunteer" element={<ProtectedRoute roles={['volunteer']}><VolunteerTasks /></ProtectedRoute>} />
      <Route path="/volunteer/active" element={<ProtectedRoute roles={['volunteer']}><ActiveTask /></ProtectedRoute>} />
      <Route path="/volunteer/my-deliveries" element={<ProtectedRoute roles={['volunteer']}><MyDeliveries /></ProtectedRoute>} />
      <Route path="/volunteer/completed" element={<ProtectedRoute roles={['volunteer']}><CompletedTasks /></ProtectedRoute>} />
      <Route path="/volunteer/impact" element={<ProtectedRoute roles={['volunteer']}><ImpactDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/profile" element={<ProtectedRoute roles={['volunteer']}><ProfilePage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminOverview /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/ngos" element={<ProtectedRoute roles={['admin']}><AdminNgos /></ProtectedRoute>} />
      <Route path="/admin/donations" element={<ProtectedRoute roles={['admin']}><AdminDonations /></ProtectedRoute>} />
      <Route path="/admin/deliveries" element={<ProtectedRoute roles={['admin']}><AdminDeliveries /></ProtectedRoute>} />
      <Route path="/admin/volunteers" element={<ProtectedRoute roles={['admin']}><AdminVolunteers /></ProtectedRoute>} />
      <Route path="/admin/verification" element={<ProtectedRoute roles={['admin']}><AdminVerification /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
