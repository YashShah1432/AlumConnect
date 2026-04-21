// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

// Import your custom ToastProvider
import { ToastProvider } from './components/Toast';

// Also import ToastContainer from react-toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Landing page components
import Navbar from './components/landing-page/Navbar';
import Hero from './components/landing-page/Hero';
import Services from './components/landing-page/Services';
import Benefit from "./components/landing-page/Benefit";
import About from './components/landing-page/About';
import Contact from './components/landing-page/Contact';
import Footer from './components/landing-page/Footer';

// Routes for public and protected pages
import Login from './routes/Login';
import Signup from './routes/Signup';
import ForgotPassword from './routes/ForgotPassword';
import PrivacyPolicy from "./routes/technical_support/PrivacyPolicy";
import TermsOfService from "./routes/technical_support/TermsOfService";
import Support from "./routes/technical_support/Support";
import ProtectedRoute from './components/ProtectedRoute';
import Announcement from './routes/announcement/Announcement';
import AdminAnnouncements from './routes/AdminAnnouncements';
import CreateEvent from './routes/CreateEvent';
import Network from './routes/network/Network';
import Discussion from './routes/Discussion';
import Donations from './routes/donation/Donations';
import Profile from './routes/Profile';
import AllAlumni from './routes/network/AllAlumni';
import AllAchievements from './routes/announcement/AllAchievements';
import AllEvents from './routes/announcement/AllEvents';
import CreateAchievement from './routes/announcement/CreateAchievement';

// Donation-related routes
import DonationProcess from './routes/donation/DonationProcess';
import CreateFundingRequest from './routes/donation/CreateFundingRequest';
import FundingOpportunities from './routes/donation/FundingOpportunities';

// New Job-related routes
import AllJobs from './routes/network/AllJobs';
import CreateJobOpportunity from './routes/network/CreateJobOpportunity';
import JobCard from './components/network/JobCard';
import ApplyForm from './components/network/ApplyForm';
import ActivityCenter from "./components/network/ActivityCenter";

import AdminNetwork from './routes/network/AdminNetwork';
import AdminDonations from './routes/AdminDonations';
import AdminProfile from './routes/AdminProfile';
import AdminDiscussion from './routes/AdminDiscussion';
import AdminDashboard from "./routes/AdminDashboard";

// Messaging
import { MessageProvider } from './context/MessageContext';

// Landing page component
const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // small delay to ensure layout is ready
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // no hash: go to top (Hero section)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div id="top" className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-5">
        <Hero />
        <Services />
        <Benefit />
        <About />
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

// AppRoutes component with role-based routing
const AppRoutes = () => {
  const { user } = useUser();
  const role = user?.role?.toLowerCase() || 'student';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/jobs" element={<JobCard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/apply/:jobId" element={<ApplyForm />} />

      {/* New static pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />

      {role === 'admin' ? (
        // Admin-specific routes
        <>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute>
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/network"
            element={
              <ProtectedRoute>
                <AdminNetwork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/discussion"
            element={
              <ProtectedRoute>
                <AdminDiscussion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donation"
            element={
              <ProtectedRoute>
                <AdminDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
        </>
      ) : (
        // Routes for alumni and students
        <>
          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discussion"
            element={
              <ProtectedRoute>
                <Discussion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donation"
            element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/announcements/all-events" element={<AllEvents />} />
          <Route path="/announcements/all-achievements" element={<AllAchievements />} />
          <Route
            path="/create-achievement"
            element={
              <ProtectedRoute>
                <CreateAchievement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network/all-people"
            element={
              <ProtectedRoute>
                <AllAlumni />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network/all-jobs"
            element={
              <ProtectedRoute>
                <AllJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network/create-job"
            element={
              <ProtectedRoute>
                <CreateJobOpportunity />
              </ProtectedRoute>
            }
          />

          // In your routes definition
          <Route
            path="/network/activity"
            element={
              <ProtectedRoute>
                <ActivityCenter />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/network/activity" element={<ActivityCenter />} /> */}

          <Route
            path="/donation/process"
            element={
              <ProtectedRoute>
                <DonationProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donation/create-funding-request"
            element={
              <ProtectedRoute>
                <CreateFundingRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donation/opportunities"
            element={
              <ProtectedRoute>
                <FundingOpportunities />
              </ProtectedRoute>
            }
          />
        </>
      )}
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <MessageProvider>
        <BrowserRouter>
          <ToastProvider>
            {/* ToastContainer for notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar
              newestOnTop
              closeOnClick
              pauseOnHover
            />
            <AppRoutes />
          </ToastProvider>
        </BrowserRouter>
      </MessageProvider>
    </UserProvider>
  );
};

export default App;
