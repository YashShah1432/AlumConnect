// client/src/routes/CreateFundingRequest.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { showErrorToast } from '../../utils/toast';
import { showSuccessToast } from '../../utils/toast'; // ADD

const CreateFundingRequest = () => {
  const [requestData, setRequestData] = useState({
    studentName: '',
    title: '',
    details: '',
    category: '',
    amount: '',
    authorEmail: '',
    batch: '',
    status: 'pending'
  });

  const [approvalCertificate, setApprovalCertificate] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_backend_URL}/auth/profile`,
          { withCredentials: true }
        );

        setUserRole(response.data.role || null);

        // Block alumni from this page
        if (response.data.role === 'alumni') {
          setError('Only students can create funding requests.');
          setTimeout(() => navigate('/donation'), 2000);
          return;
        }

        setRequestData(prev => ({
          ...prev,
          studentName: response.data.name || '',
          authorEmail: response.data.email || '',
          batch: response.data.batch || ''
        }));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Unable to load your profile. Please sign in again.');
      }
    };
    fetchUserData();
  }, [navigate]);

  if (userRole === null && !error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  const validateBeforeSubmit = () => {
    if (!requestData.studentName || !requestData.authorEmail || !requestData.batch) {
      const msg = 'Profile data not loaded. Please re-login.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }
    if (!requestData.title) {
      const msg = 'Project title is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }
    if (!requestData.category) {
      const msg = 'Category is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }
    if (!requestData.amount) {
      const msg = 'Amount is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }
    if (!requestData.details) {
      const msg = 'Detailed description is required.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    if (!approvalCertificate) {
      const msg = 'Please upload approval certificate.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    const maxBytes = 512 * 1024;
    if (approvalCertificate.size > maxBytes) {
      const msg = 'Approval certificate must be <= 512KB.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedTypes.includes(approvalCertificate.type)) {
      const msg = 'Approval certificate must be PNG, JPG, or PDF.';
      setError(msg);
      showErrorToast(msg);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateBeforeSubmit()) return;

    try {
      setSubmitting(true);

      const form = new FormData();
      form.append('studentName', requestData.studentName);
      form.append('title', requestData.title);
      form.append('category', requestData.category);
      form.append('amount', String(requestData.amount));
      form.append('batch', requestData.batch);
      form.append('details', requestData.details);
      form.append('approvalCertificate', approvalCertificate);

      await axios.post(
        `${import.meta.env.VITE_backend_URL}/api/opportunities/createOpportunity`,
        form,
        { withCredentials: true }
      );

      // NOTE: show success toast ONLY on /donation page (same pattern as DonationProcess.jsx)
      navigate('/donation', {
        replace: true,
        state: { showFundingSubmittedToast: true }
      });
    } catch (err) {
      console.error('Submission error:', err.response?.data || err);

      const msg =
        err.response?.data?.message ||
        'Unable to submit funding request. Please try again.';

      setError(msg);
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate('/donation')}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Funding Request</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* name, email, batch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={requestData.studentName}
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={requestData.authorEmail}
                  readOnly
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  value={requestData.batch}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* project title, category, amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={requestData.title}
                  onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={requestData.category}
                  onChange={(e) => setRequestData({ ...requestData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="startup">Startup</option>
                  <option value="research">Research</option>
                  <option value="innovation">Innovation</option>
                  <option value="patent">Patent</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Amount Required</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={requestData.amount}
                  onChange={(e) => setRequestData({ ...requestData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="5"
                value={requestData.details}
                onChange={(e) => setRequestData({ ...requestData, details: e.target.value })}
                required
              />
            </div>

            {/* Upload Approval Certificate (last) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Approval Certificate (PNG/JPG/PDF, max 512KB)
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setError('');
                  setApprovalCertificate(null);

                  if (!file) return;

                  const maxBytes = 512 * 1024;
                  if (file.size > maxBytes) {
                    const msg = 'Approval certificate must be <= 512KB.';
                    setError(msg);
                    showErrorToast(msg);
                    e.target.value = '';
                    return;
                  }

                  const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
                  if (!allowedTypes.includes(file.type)) {
                    const msg = 'Approval certificate must be PNG, JPG, or PDF.';
                    setError(msg);
                    showErrorToast(msg);
                    e.target.value = '';
                    return;
                  }

                  setApprovalCertificate(file);
                }}
                required
              />
              {approvalCertificate && (
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {approvalCertificate.name} ({Math.ceil(approvalCertificate.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* error / success */}
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateFundingRequest;