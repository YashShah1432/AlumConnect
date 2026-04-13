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

  // 🔹 Alumni filters
  const [alumniStatusFilter, setAlumniStatusFilter] = useState('');
  const [alumniCategoryFilter, setAlumniCategoryFilter] = useState('');
  const [alumniBatchFilter, setAlumniBatchFilter] = useState('');
  const [alumniAmountMin, setAlumniAmountMin] = useState('');
  const [alumniAmountMax, setAlumniAmountMax] = useState('');
  const [alumniDateRange, setAlumniDateRange] = useState(''); // '', 'today', 'week', 'month', 'year'

  // 🔹 Student funding filters
  const [studentStatusFilter, setStudentStatusFilter] = useState('');
  const [studentCategoryFilter, setStudentCategoryFilter] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState('');
  const [studentAmountMin, setStudentAmountMin] = useState('');
  const [studentAmountMax, setStudentAmountMax] = useState('');
  const [studentDateRange, setStudentDateRange] = useState('');

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

  // ✅ Copy UTR to clipboard and show tick icon
  const copyToClipboard = async (utrValue, id) => {
    try {
      if (!utrValue) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(utrValue);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = utrValue;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedUtrId(id);

      // Reset icon after 1.5s
      setTimeout(() => {
        setCopiedUtrId(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy UTR:', err);
    }
  };

   // Helper: check if date is within selected range (today/week/month/year)
  const isWithinRange = (dateValue, range) => {
    if (!range || !dateValue) return true;

    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const start = new Date(now);

    switch (range) {
      case 'today':
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      case 'week': {
        const day = now.getDay(); // 0 = Sun
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return d >= start && d <= now;
      }
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          d >= start &&
          d <= now
        );
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        return d.getFullYear() === now.getFullYear() && d >= start && d <= now;
      default:
        return true;
    }
  };

  // 🔹 FILTERED ALUMNI DONATIONS
  const filteredDonations = donations.filter((donation) => {
    // status
    const statusMatch = alumniStatusFilter
      ? donation.status === alumniStatusFilter
      : true;

    // category (purpose)
    const categoryMatch = alumniCategoryFilter
      ? (donation.purpose || '').toLowerCase().includes(
          alumniCategoryFilter.toLowerCase()
        )
      : true;

    // batch
    const batchMatch = alumniBatchFilter
      ? (donation.batch || '').toLowerCase().includes(
          alumniBatchFilter.toLowerCase()
        )
      : true;

    // amount range
    const amount = Number(donation.amount || 0);
    const minOk = alumniAmountMin
      ? amount >= Number(alumniAmountMin)
      : true;
    const maxOk = alumniAmountMax
      ? amount <= Number(alumniAmountMax)
      : true;

    // date range on paymentDate
    const dateOk = isWithinRange(donation.paymentDate, alumniDateRange);

    return statusMatch && categoryMatch && batchMatch && minOk && maxOk && dateOk;
  });

  // 🔹 FILTERED STUDENT OPPORTUNITIES
  const filteredOpportunities = opportunities.filter((opp) => {
    const statusMatch = studentStatusFilter
      ? opp.status === studentStatusFilter
      : true;

    const categoryMatch = studentCategoryFilter
      ? (opp.category || '').toLowerCase().includes(
          studentCategoryFilter.toLowerCase()
        )
      : true;

    const batchMatch = studentBatchFilter
      ? (opp.batch || '').toLowerCase().includes(
          studentBatchFilter.toLowerCase()
        )
      : true;

    const amount = Number(opp.amount || 0);
    const minOk = studentAmountMin
      ? amount >= Number(studentAmountMin)
      : true;
    const maxOk = studentAmountMax
      ? amount <= Number(studentAmountMax)
      : true;

    // date range on createdAt
    const dateOk = isWithinRange(opp.createdAt, studentDateRange);

    return statusMatch && categoryMatch && batchMatch && minOk && maxOk && dateOk;
  });

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
                ${selectedTab === 'alumni'
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
                ${selectedTab === 'students'
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
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Filter: 
              </h1>

              {/* 🔹 Filters (responsive, like AdminProfile) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm"
              >
                {/* Status */}
                <select
                  value={alumniStatusFilter}
                  onChange={(e) => setAlumniStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-36"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Category (purpose) */}
                <input
                  type="text"
                  value={alumniCategoryFilter}
                  onChange={(e) => setAlumniCategoryFilter(e.target.value)}
                  placeholder="Filter by category"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                />

                {/* Batch */}
                <input
                  type="text"
                  value={alumniBatchFilter}
                  onChange={(e) => setAlumniBatchFilter(e.target.value)}
                  placeholder="Filter by batch"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                />

                {/* Amount range */}
                <input
                  type="number"
                  value={alumniAmountMin}
                  onChange={(e) => setAlumniAmountMin(e.target.value)}
                  placeholder="Min amount"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-[47%] sm:w-28"
                />
                <input
                  type="number"
                  value={alumniAmountMax}
                  onChange={(e) => setAlumniAmountMax(e.target.value)}
                  placeholder="Max amount"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-[47%] sm:w-28"
                />

                {/* Payment date range */}
                <select
                  value={alumniDateRange}
                  onChange={(e) => setAlumniDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                >
                  <option value="">All Payment Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>

                {(alumniStatusFilter ||
                  alumniCategoryFilter ||
                  alumniBatchFilter ||
                  alumniAmountMin ||
                  alumniAmountMax ||
                  alumniDateRange) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAlumniStatusFilter('');
                      setAlumniCategoryFilter('');
                      setAlumniBatchFilter('');
                      setAlumniAmountMin('');
                      setAlumniAmountMax('');
                      setAlumniDateRange('');
                    }}
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {filteredDonations.length === 0 ? (
              <p className="text-gray-600 text-center">
                {donations.length === 0
                  ? 'No donation requests found.'
                  : 'No donations match the selected filters.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation) => (
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
                      {/* Email */}
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <Mail className="mt-0.5 text-gray-500" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium break-all">
                            {donation.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Amount + Payment Date (2 columns, first wider on sm+) */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3">
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

                      {/* UTR + Batch (2 columns, first wider on sm+) */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3">
                        {/* UTR */}
                        <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                          <Hash className="mt-0.5 text-gray-500 shrink-0" size={16} />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">UTR No.</p>

                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-medium break-all">
                                {donation.utrNo || 'N/A'}
                              </p>

                              {donation.utrNo ? (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(donation.utrNo, donation._id)}
                                  className={`shrink-0 inline-flex items-center justify-center rounded-md p-1.5 border transition ${copiedUtrId === donation._id
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
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Filter: 
              </h1>

              {/* 🔹 Filters (responsive) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm"
              >
                {/* Status */}
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-36"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Category */}
                <input
                  type="text"
                  value={studentCategoryFilter}
                  onChange={(e) => setStudentCategoryFilter(e.target.value)}
                  placeholder="Filter by category"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                />

                {/* Batch */}
                <input
                  type="text"
                  value={studentBatchFilter}
                  onChange={(e) => setStudentBatchFilter(e.target.value)}
                  placeholder="Filter by batch"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                />

                {/* Amount range (Amount Requested) */}
                <input
                  type="number"
                  value={studentAmountMin}
                  onChange={(e) => setStudentAmountMin(e.target.value)}
                  placeholder="Min amount"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-[47%] sm:w-28"
                />
                <input
                  type="number"
                  value={studentAmountMax}
                  onChange={(e) => setStudentAmountMax(e.target.value)}
                  placeholder="Max amount"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-[47%] sm:w-28"
                />

                {/* Created date range */}
                <select
                  value={studentDateRange}
                  onChange={(e) => setStudentDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                >
                  <option value="">All Created Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>

                {(studentStatusFilter ||
                  studentCategoryFilter ||
                  studentBatchFilter ||
                  studentAmountMin ||
                  studentAmountMax ||
                  studentDateRange) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentStatusFilter('');
                      setStudentCategoryFilter('');
                      setStudentBatchFilter('');
                      setStudentAmountMin('');
                      setStudentAmountMax('');
                      setStudentDateRange('');
                    }}
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {filteredOpportunities.length === 0 ? (
              <p className="text-gray-600 text-center">
                {opportunities.length === 0
                  ? 'No funding requests found.'
                  : 'No funding requests match the selected filters.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map((opp) => (
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