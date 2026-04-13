// client/src/routes/AdminDonations.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import {
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Download,
  Mail,
  Wallet,
  CalendarDays,
  Hash,
  Copy,
  Check,
  GraduationCap
} from 'lucide-react';
import { useSidebarLayout } from '../hooks/useSidebarLayout';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedUtrId, setCopiedUtrId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('alumni');

  const navigate = useNavigate();
  useSidebarLayout(true);

  // ✅ INITIAL LOAD: check admin + fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Verify admin
        const profileRes = await axios.get(
          `${import.meta.env.VITE_backend_URL}/auth/profile`,
          { withCredentials: true }
        );

        if (profileRes.data.role !== 'admin') {
          setError('Access denied. Admins only.');
          // optional: redirect away
          navigate('/announcements');
          return;
        }

        // 2️⃣ Fetch donations + opportunities in parallel
        const [donRes, oppRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_backend_URL}/api/donations/admin`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_backend_URL}/api/opportunities/admin`,
            { withCredentials: true }
          )
        ]);

        setDonations(Array.isArray(donRes.data) ? donRes.data : []);
        setOpportunities(Array.isArray(oppRes.data) ? oppRes.data : []);
        setError('');
      } catch (err) {
        console.error('Error loading admin donations:', err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to load requests.';
        setError(msg);
      } finally {
        // ✅ ensure loading is cleared in all cases
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

   // ✅ date formatter: DD/MM/YYYY (day first, then month)
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 0‑based
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 font-medium">Loading requests...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center p-8 text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* ===== Tabs Header (Alumni / Student) ===== */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setSelectedTab('alumni')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${
                  selectedTab === 'alumni'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Alumni Donation Requests
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('students')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${
                  selectedTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Student Funding Requests
            </button>
          </nav>
        </div>

        {/* ===== Tab Panels ===== */}
        {/* Alumni Donations Tab */}
        {selectedTab === 'alumni' && (
          <section>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Alumni Donation Requests
            </h1>

            {donations.length === 0 ? (
              <p className="text-gray-600 text-center">No donation requests found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => (
                  // ...existing donation card JSX...
                  <div
                    key={donation._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {donation.name || 'Untitled Donation'}
                        </h2>
                      </div>

                      <div className="shrink-0">
                        <StatusPill status={donation.status} />
                      </div>
                    </div>

                    {/* Purpose badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                        {donation.purpose || 'general'}
                      </span>
                    </div>

                    {/* Details (uniform grid) */}
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Mail className="mt-0.5 text-gray-500" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium break-all">
                            {donation.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Wallet className="mt-0.5 text-gray-500" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-semibold text-gray-900">
                              ₹{Number(donation.amount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <CalendarDays className="mt-0.5 text-gray-500" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Payment Date</p>
                            <p className="font-medium">
                              {formatDate(donation.paymentDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* UTR */}
                        <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                          <Hash className="mt-0.5 text-gray-500 shrink-0" size={16} />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">UTR No.</p>

                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-medium truncate max-w-[18ch] sm:max-w-[16ch]">
                                {donation.utrNo || 'N/A'}
                              </p>

                              {donation.utrNo ? (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(donation.utrNo, donation._id)}
                                  className={`shrink-0 inline-flex items-center justify-center rounded-md p-1.5 border transition ${
                                    copiedUtrId === donation._id
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                  title={
                                    copiedUtrId === donation._id ? 'Copied' : 'Copy UTR No.'
                                  }
                                  aria-label={
                                    copiedUtrId === donation._id ? 'Copied' : 'Copy UTR No.'
                                  }
                                >
                                  {copiedUtrId === donation._id ? (
                                    <Check size={16} />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Batch */}
                        <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                          <GraduationCap
                            className="mt-0.5 text-gray-500 shrink-0"
                            size={16}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Batch</p>
                            <p className="font-medium text-gray-900 truncate">
                              {donation.batch || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {donation.comments && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Comments</p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {donation.comments}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Proof buttons */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-500 mb-2">Payment Proof</p>

                      {donation.paymentProofUrl ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a
                            href={donation.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            title="Open payment proof"
                          >
                            <ExternalLink size={16} />
                            View
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              downloadFromUrl(
                                donation.paymentProofUrl,
                                `payment-proof_${donation.name || 'donor'}_${donation._id}`
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition"
                            title="Download payment proof"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">N/A</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-wrap gap-2">
                      {donation.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAcceptDonation(donation._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition flex-1"
                          >
                            <CheckCircle2 size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectDonation(donation._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRejectDonation(donation._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-700 text-white hover:bg-gray-800 transition w-full"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Student Funding Requests Tab */}
        {selectedTab === 'students' && (
          <section>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Student Funding Requests
            </h1>
            {opportunities.length === 0 ? (
              <p className="text-gray-600 text-center">No funding requests found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opp) => (
                  // ...existing opportunity card JSX...
                  <div
                    key={opp._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                  >
                    {/* Header (SWAPPED): show Student Name as main title; Project Title as subtitle */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {opp.studentName || 'Student'}
                        </h2>
                      </div>

                      <div className="shrink-0">
                        <OpportunityStatusPill status={opp.status} />
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                        {opp.category || 'general'}
                      </span>
                    </div>

                    {/* Details box */}
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Mail className="mt-0.5 text-gray-500" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium break-all">
                            {opp.authorEmail || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Wallet className="mt-0.5 text-gray-500" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Amount Requested</p>
                            <p className="font-semibold text-gray-900">
                              ₹{Number(opp.amount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <CalendarDays className="mt-0.5 text-gray-500" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Created On</p>
                            <p className="font-medium">{formatDate(opp.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                          <GraduationCap
                            className="mt-0.5 text-gray-500 shrink-0"
                            size={16}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Batch</p>
                            <p className="font-medium text-gray-900 truncate">
                              {opp.batch || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Project Title</p>
                        <p className="text-sm font-semibold text-gray-900 whitespace-normal break-words">
                          {opp.title || 'Untitled Project'}
                        </p>
                      </div>

                      {opp.details && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Detailed Description</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {opp.details}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Certificate buttons */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-500 mb-2">Approval Certificate</p>

                      {opp.approvalCertificateUrl ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a
                            href={opp.approvalCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                            title="Open approval certificate"
                          >
                            <ExternalLink size={16} />
                            View
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              downloadFromUrl(
                                opp.approvalCertificateUrl,
                                `approval-certificate_${opp.studentName || 'student'}_${opp._id}`
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition"
                            title="Download approval certificate"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">N/A</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-wrap gap-2">
                      {opp.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAcceptOpportunity(opp._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition flex-1"
                          >
                            <CheckCircle2 size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectOpportunity(opp._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRejectOpportunity(opp._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-700 text-white hover:bg-gray-800 transition w-full"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default AdminDonations;

// Status pill for donations
const StatusPill = ({ status }) => {
  let bgClass = '';
  let textClass = '';
  let displayStatus = status;

  switch (status) {
    case 'pending':
      bgClass = 'bg-yellow-100';
      textClass = 'text-yellow-800';
      break;
    case 'accepted':
      bgClass = 'bg-green-100';
      textClass = 'text-green-800';
      break;
    case 'rejected':
      bgClass = 'bg-red-100';
      textClass = 'text-red-800';
      break;
    default:
      bgClass = 'bg-gray-100';
      textClass = 'text-gray-800';
      displayStatus = 'unknown';
      break;
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bgClass} ${textClass}`}
    >
      {displayStatus}
    </span>
  );
};

// Status pill for opportunities (approved/pending/rejected)
const OpportunityStatusPill = ({ status }) => {
  let bgClass = '';
  let textClass = '';
  let displayStatus = status;

  switch (status) {
    case 'pending':
      bgClass = 'bg-yellow-100';
      textClass = 'text-yellow-800';
      break;
    case 'approved':
      bgClass = 'bg-green-100';
      textClass = 'text-green-800';
      break;
    case 'rejected':
      bgClass = 'bg-red-100';
      textClass = 'text-red-800';
      break;
    default:
      bgClass = 'bg-gray-100';
      textClass = 'text-gray-800';
      displayStatus = 'unknown';
      break;
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bgClass} ${textClass}`}
    >
      {displayStatus}
    </span>
  );
};