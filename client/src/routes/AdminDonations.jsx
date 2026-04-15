// client/src/routes/AdminDonations.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import axios from 'axios';
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
  useSidebarLayout(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [donRes, oppRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_backend_URL}/api/donations/admin`, {
            withCredentials: true
          }),
          axios.get(`${import.meta.env.VITE_backend_URL}/api/opportunities/admin`, {
            withCredentials: true
          })
        ]);

        setDonations(donRes.data);
        setOpportunities(oppRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load donation and funding requests');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
  };

  const downloadFromUrl = async (url, filename = 'file') => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();

      const extFromType =
        blob.type === 'application/pdf'
          ? 'pdf'
          : blob.type === 'image/png'
            ? 'png'
            : blob.type === 'image/jpeg'
              ? 'jpg'
              : blob.type === 'image/webp'
                ? 'webp'
                : 'bin';

      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `${filename}.${extFromType}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      setError('Unable to download file.');
    }
  };

  const handleAcceptDonation = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/donations/admin/${id}/accept`,
        {},
        { withCredentials: true }
      );
      setDonations((prev) =>
        prev.map((donation) => (donation._id === id ? res.data.data : donation))
      );
    } catch (err) {
      console.error('Error accepting donation:', err);
      setError('Failed to accept donation');
    }
  };

  const handleRejectDonation = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/donations/admin/${id}/reject`,
        {},
        { withCredentials: true }
      );

      // keep the rejected donation in list (so admin sees it as rejected)
      setDonations((prev) =>
        prev.map((donation) => (donation._id === id ? res.data.data : donation))
      );
    } catch (err) {
      console.error('Error rejecting donation:', err);
      setError('Failed to reject donation');
    }
  };

  const handleAcceptOpportunity = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/opportunities/admin/${id}/accept`,
        {},
        { withCredentials: true }
      );
      setOpportunities((prev) =>
        prev.map((opp) => (opp._id === id ? res.data.data : opp))
      );
    } catch (err) {
      console.error('Error accepting funding request:', err);
      setError('Failed to accept funding request');
    }
  };

  const handleRejectOpportunity = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_backend_URL}/api/opportunities/admin/${id}`,
        { withCredentials: true }
      );
      setOpportunities((prev) => prev.filter((opp) => opp._id !== id));
    } catch (err) {
      console.error('Error rejecting funding request:', err);
      setError('Failed to reject funding request');
    }
  };

  const copyToClipboard = async (text, donationId) => {
    try {
      if (!text) return;
      await navigator.clipboard.writeText(String(text));

      // set "copied" state for this donation card
      setCopiedUtrId(donationId);

      // revert icon after a short delay
      window.clearTimeout(window.__utrCopyTimer);
      window.__utrCopyTimer = window.setTimeout(() => {
        setCopiedUtrId(null);
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy to clipboard.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading requests...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center p-8 text-red-500 dark:text-red-400">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Section 1: Alumni Donation Requests */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Alumni Donation Requests
          </h1>

          {donations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">No donation requests found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {donation.name || 'Untitled Donation'}
                      </h2>
                    </div>

                    <div className="shrink-0">
                      <StatusPill status={donation.status} />
                    </div>
                  </div>

                  {/* Purpose badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
                      {donation.purpose || 'general'}
                    </span>
                  </div>

                  {/* Details (uniform grid) */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 p-4 space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Mail className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium break-all dark:text-white">
                          {donation.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Wallet className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₹{Number(donation.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CalendarDays className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                          <p className="font-medium dark:text-white">{formatDate(donation.paymentDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* UTR */}
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                        <Hash className="mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">UTR No.</p>

                          <div className="flex items-center gap-2 min-w-0">
                            {/* IMPORTANT: truncates like other fields (similar to Amount width) */}
                            <p className="font-medium truncate max-w-[18ch] sm:max-w-[16ch] dark:text-white">
                              {donation.utrNo || 'N/A'}
                            </p>

                            {donation.utrNo ? (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(donation.utrNo, donation._id)}
                                className={`shrink-0 inline-flex items-center justify-center rounded-md p-1.5 border transition ${copiedUtrId === donation._id
                                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                title={copiedUtrId === donation._id ? 'Copied' : 'Copy UTR No.'}
                                aria-label={copiedUtrId === donation._id ? 'Copied' : 'Copy UTR No.'}
                              >
                                {copiedUtrId === donation._id ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Batch */}
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                        <GraduationCap className="mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Batch</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{donation.batch || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {donation.comments && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Comments</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {donation.comments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Proof buttons */}
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Payment Proof</p>

                    {donation.paymentProofUrl ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={donation.paymentProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
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
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                          title="Download payment proof"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">N/A</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {donation.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptDonation(donation._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-700 transition flex-1"
                        >
                          <CheckCircle2 size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectDonation(donation._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 transition flex-1"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRejectDonation(donation._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-700 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition w-full"
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

        {/* Section 2: Student Funding Requests */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Student Funding Requests
          </h1>
          {opportunities.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">No funding requests found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <div
                  key={opp._id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                >
                  {/* Header (SWAPPED): show Student Name as main title; Project Title as subtitle */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {opp.studentName || 'Student'}
                      </h2>
                    </div>

                    <div className="shrink-0">
                      <OpportunityStatusPill status={opp.status} />
                    </div>
                  </div>

                  {/* Category badge (same styling as Alumni Donation Requests) */}
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold">
                      {opp.category || 'general'}
                    </span>
                  </div>

                  {/* Details box */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 p-4 space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Mail className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium break-all dark:text-white">{opp.authorEmail || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Amount + Created Date (responsive 1-col on mobile, 2-col on sm+) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Wallet className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Amount Requested</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ₹{Number(opp.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CalendarDays className="mt-0.5 text-gray-500 dark:text-gray-400" size={16} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Created On</p>
                          <p className="font-medium dark:text-white">{formatDate(opp.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                      {/* Batch (full width like donation card layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                        <GraduationCap className="mt-0.5 text-gray-500 dark:text-gray-400 shrink-0" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Batch</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{opp.batch || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Title moved here: below details box content and above opp.details section */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Project Title</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-normal break-words">
                        {opp.title || 'Untitled Project'}
                      </p>
                    </div>

                    {opp.details && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detailed Description</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {opp.details}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Certificate buttons */}
                  <div className="mb-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Approval Certificate</p>

                    {opp.approvalCertificateUrl ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={opp.approvalCertificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
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
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                          title="Download approval certificate"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">N/A</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-wrap gap-2">
                    {opp.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptOpportunity(opp._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-700 transition flex-1"
                        >
                          <CheckCircle2 size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectOpportunity(opp._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 transition flex-1"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRejectOpportunity(opp._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-700 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition w-full"
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
      bgClass = 'bg-yellow-100 dark:bg-yellow-900/40';
      textClass = 'text-yellow-800 dark:text-yellow-300';
      break;
    case 'accepted':
      bgClass = 'bg-green-100 dark:bg-green-900/40';
      textClass = 'text-green-800 dark:text-green-300';
      break;
    case 'rejected':
      bgClass = 'bg-red-100 dark:bg-red-900/40';
      textClass = 'text-red-800 dark:text-red-300';
      break;
    default:
      bgClass = 'bg-gray-100 dark:bg-gray-700';
      textClass = 'text-gray-800 dark:text-gray-300';
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
      bgClass = 'bg-yellow-100 dark:bg-yellow-900/40';
      textClass = 'text-yellow-800 dark:text-yellow-300';
      break;
    case 'approved':
      bgClass = 'bg-green-100 dark:bg-green-900/40';
      textClass = 'text-green-800 dark:text-green-300';
      break;
    case 'rejected':
      bgClass = 'bg-red-100 dark:bg-red-900/40';
      textClass = 'text-red-800 dark:text-red-300';
      break;
    default:
      bgClass = 'bg-gray-100 dark:bg-gray-700';
      textClass = 'text-gray-800 dark:text-gray-300';
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