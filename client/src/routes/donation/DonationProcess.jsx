import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import donationQr from '../../assets/donation-qr.png';
import { showErrorToast } from '../../utils/toast';

// helper: local YYYY-MM-DD (prevents "yesterday" issue caused by UTC)
const getTodayLocalStr = () => {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
};

const DonationProcess = () => {
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    email: '',
    amount: '',
    purpose: '',
    comments: '',
    utrNo: '',
    paymentDate: ''
  });

  const [paymentProof, setPaymentProof] = useState(null);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const todayStr = getTodayLocalStr();

  const lockedAmount = location.state?.lockedAmount;
  const lockedPurpose = location.state?.lockedPurpose;
  const opportunityId = location.state?.opportunityId; // ✅ ADD

  // Only lock when alumni arrived via Contribute button with valid values
  const isPrefilledFromOpportunity =
    lockedAmount !== undefined &&
    lockedAmount !== null &&
    lockedAmount !== '' &&
    lockedPurpose !== undefined &&
    lockedPurpose !== null &&
    lockedPurpose !== '';

  // Prefill amount/purpose if coming from contribute card
  useEffect(() => {
    if (!isPrefilledFromOpportunity) return;

    setFormData((prev) => ({
      ...prev,
      amount: String(lockedAmount),
      purpose: String(lockedPurpose)
    }));
  }, [isPrefilledFromOpportunity, lockedAmount, lockedPurpose]);

  // Fetch profile => autofill name/email/batch and set paymentDate default to today
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_backend_URL}/auth/profile`,
          { withCredentials: true }
        );

        const role = res.data.role || null;
        setUserRole(role);

        setFormData((prev) => ({
          ...prev,
          name: res.data.name || '',
          email: res.data.email || '',
          batch: res.data.batch || '',
          paymentDate: prev.paymentDate || todayStr
        }));

        if (role === 'student') {
          setError('Only alumni can make donations.');
          setTimeout(() => navigate('/donation'), 2000);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Unable to load your profile. Please sign in again.');
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [navigate, todayStr]);

  if (loadingRole && !error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6 px-4">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  const validateBeforeSubmit = () => {
    if (!formData.name || !formData.email || !formData.batch) {
      const msg = 'Your profile information could not be loaded. Please re-login.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!formData.amount) {
      const msg = 'Amount is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!formData.purpose) {
      const msg = 'Purpose is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    // UTR: exactly 12 digits
    if (!/^\d{12}$/.test(formData.utrNo)) {
      const msg = 'UTR No. must be exactly 12 digits.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!formData.paymentDate) {
      const msg = 'Payment date is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    // Payment date: disallow future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chosen = new Date(formData.paymentDate);
    if (Number.isNaN(chosen.getTime())) {
      const msg = 'Invalid payment date.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }
    chosen.setHours(0, 0, 0, 0);

    if (chosen > today) {
      const msg = 'Payment date cannot be in the future.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!paymentProof) {
      const msg = 'Please upload payment proof.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    const maxBytes = 512 * 1024;
    if (paymentProof.size > maxBytes) {
      const msg = 'Payment proof image must be <= 512KB.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!paymentProof.type?.startsWith('image/')) {
      const msg = 'Payment proof must be an image file.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateBeforeSubmit()) return;

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('batch', formData.batch);
      payload.append('amount', formData.amount);
      payload.append('purpose', formData.purpose);
      payload.append('comments', formData.comments);
      payload.append('utrNo', formData.utrNo);
      payload.append('paymentDate', formData.paymentDate);
      payload.append('paymentProof', paymentProof);

      // ✅ if donation is for an opportunity, send it
      if (opportunityId) {
        payload.append('opportunityId', String(opportunityId));
      }

      await axios.post(
        `${import.meta.env.VITE_backend_URL}/api/donations`,
        payload,
        { withCredentials: true }
      );

      // Show success toast ONLY on /donation
      navigate('/donation', {
        replace: true,
        state: { showDonationSubmittedToast: true }
      });
    } catch (err) {
      console.log('Submission error:', err.response?.data);
      const msg = err.response?.data?.message || 'Error submitting donation';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate('/donation')}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md py-6 px-4">
          {userRole === 'student' ? (
            <p className="text-center text-red-600">
              Only alumni can make donations. Redirecting...
            </p>
          ) : (
            <>
              {/* Bank Account Info (Exam Fees Details) + QR */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Bank Account Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="sm:col-span-2">
                        <p className="font-medium">Bank Account:</p>
                        <p>Walchand Institute of Technology, Exam Section</p>
                      </div>

                      <div>
                        <p className="font-medium">Bank Name:</p>
                        <p>State Bank of India, Solapur</p>
                      </div>

                      <div>
                        <p className="font-medium">IFSC Code:</p>
                        <p>SBIN0000483</p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="font-medium">Current Account No.:</p>
                        <p>40820570446</p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="font-medium">Address of the Bank:</p>
                        <p>Balives Branch, Solapur</p>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <p className="text-sm font-medium text-blue-800 mb-2 md:text-center">
                      Scan to Pay
                    </p>
                    <div className="bg-white rounded-lg p-2 shadow-sm inline-block">
                      <img
                        src={donationQr}
                        alt="Donation QR"
                        className="h-40 w-40 sm:h-44 sm:w-44 object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={formData.name}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    value={formData.email}
                    readOnly
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Year
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      value={formData.batch}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Donated
                    </label>
                    <input
                      type="number"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isPrefilledFromOpportunity ? 'bg-gray-100' : ''
                        }`}
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                      min="0"
                      readOnly={isPrefilledFromOpportunity}
                      disabled={isPrefilledFromOpportunity}
                    />
                  </div>
                </div>

                {/* UTR + Payment Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UTR No. (12 digits)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{12}"
                      maxLength={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.utrNo}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setFormData({ ...formData, utrNo: digitsOnly });
                      }}
                      required
                      title="UTR No. must be exactly 12 digits"
                      placeholder="Enter 12-digit UTR"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      max={todayStr}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.paymentDate}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentDate: e.target.value })
                      }
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Future dates are not allowed.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose of Donation
                  </label>

                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isPrefilledFromOpportunity ? 'bg-gray-100' : ''
                      }`}
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    required
                    disabled={isPrefilledFromOpportunity}
                  >
                    <option value="">Select Purpose</option>
                    <option value="startup">Startup</option>
                    <option value="research">Research</option>
                    <option value="innovation">Innovation</option>
                    <option value="patent">Patent</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Upload Payment Proof */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Payment Proof (Image, max 512KB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setError('');
                      setPaymentProof(null);

                      if (!file) return;

                      const maxBytes = 512 * 1024;
                      if (file.size > maxBytes) {
                        const msg = 'Payment proof image must be <= 512KB.';
                        setError(msg);
                        showErrorToast(msg);
                        e.target.value = '';
                        return;
                      }
                      if (!file.type?.startsWith('image/')) {
                        const msg = 'Payment proof must be an image file.';
                        setError(msg);
                        showErrorToast(msg);
                        e.target.value = '';
                        return;
                      }

                      setPaymentProof(file);
                    }}
                    required
                  />
                  {paymentProof && (
                    <p className="mt-1 text-xs text-gray-600">
                      Selected: {paymentProof.name} ({Math.ceil(paymentProof.size / 1024)} KB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="4"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Details'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Note: You will receive the tax exemption document via email once your donation is verified.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DonationProcess;