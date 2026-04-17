import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing-page/Navbar';
import Footer from '../components/landing-page/Footer';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import axios from '../utils/axiosConfig';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Use your icon set
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email/otp, 2: new password
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

    const navigate = useNavigate();

    // Timer for resend
    useEffect(() => {
    let interval;
    if (showOtpField && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpField, timer]);

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await axios.post('/auth/forgot-password', { email });
      showSuccessToast('OTP sent to your email');
      setShowOtpField(true);
      setTimer(60);
      setOtp('');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to send OTP');
    }
    setIsSending(false);
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await axios.post('/auth/verify-reset-otp', { email, otp });
      showSuccessToast('OTP verified');
      setStep(2);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Invalid OTP');
    }
    setIsSending(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await axios.post('/auth/forgot-password', { email });
      showSuccessToast('OTP resent');
      setTimer(60);
      setOtp('');
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to resend OTP');
    }
    setIsResending(false);
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showErrorToast('Password must be at least 8 characters, include upper, lower, digit, and special character.');
      return;
    }
    setIsSending(true);
    try {
      await axios.post('/auth/reset-password', { email, otp, newPassword });
      showSuccessToast('Password reset successful!');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Failed to reset password');
    }
    setIsSending(false);
  };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    // Back button handler for password step
    const handleBackToOtp = () => {
  setStep(1);
  setShowOtpField(false); // Hide OTP field
  setOtp('');
  setTimer(60);
};

    return (
        <>
            <Navbar />
      <div className="min-h-[79.1vh] sm:min-h-[78vh] flex items-center justify-center bg-gray-50 p-4 pt-10">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          {step === 1 && (
            <form onSubmit={showOtpField ? handleVerifyOtp : handleSendOtp}>
              <button
                type="button"
                className="flex items-center mb-4 text-gray-500 hover:text-blue-600"
                onClick={() => {
                  if (showOtpField) {
                    setShowOtpField(false);
                    setOtp('');
                    setTimer(60);
                  } else {
                    handleBackToLogin();
                  }
                }}
              >
                <ArrowLeft className="h-5 w-5 mr-1" /> Back
              </button>
              <h2 className="text-xl font-bold mb-4">Password Reset</h2>
              <p className="mb-4 text-gray-600">Enter your email to receive an OTP.</p>
              <input
                type="email"
                className="w-full mb-4 p-2 border rounded"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={showOtpField}
              />
              {showOtpField && (
                <>
                  <input
                    type="text"
                    className="w-full mb-4 p-2 border rounded"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                  />
                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      className="text-blue-600 flex items-center"
                      onClick={handleResendOtp}
                      disabled={timer > 0 || isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-1" />
                          Resend
                        </>
                      ) : (
                        <>Resend {timer > 0 ? `(${timer}s)` : ''}</>
                      )}
                    </button>
                  </div>
                </>
              )}
              <button
                className="w-full bg-blue-600 text-white rounded p-2 flex items-center justify-center"
                type="submit"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    {showOtpField ? 'Verifying OTP...' : 'Sending OTP...'}
                  </>
                ) : (
                  showOtpField ? 'Verify OTP' : 'Send OTP'
                )}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <button
                type="button"
                className="flex items-center mb-4 text-gray-500 hover:text-blue-600"
                onClick={handleBackToOtp}
              >
                <ArrowLeft className="h-5 w-5 mr-1" /> Back
              </button>
              <h2 className="text-xl font-bold mb-4">Set New Password</h2>
              <input
                type="password"
                className="w-full mb-4 p-2 border rounded"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full mb-4 p-2 border rounded"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mb-4">
                Password must be at least 8 characters, include upper, lower, digit, and special character.
              </p>
              <button
                className="w-full bg-blue-600 text-white rounded p-2 flex items-center justify-center"
                type="submit"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
        </>
    );
};

export default ForgotPassword;