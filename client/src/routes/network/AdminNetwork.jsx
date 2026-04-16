import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import axios from 'axios';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Wallet,
  CalendarDays,
  Mail,
} from 'lucide-react';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const AdminNetwork = () => {
  const [selectedTab, setSelectedTab] = useState('profiles');
  const [pendingUsers, setPendingUsers] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedJobId, setCopiedJobId] = useState(null);

  // 🔹 Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // employmentType
  const [deadlineRange, setDeadlineRange] = useState(''); // '', today, week, month, year

  useSidebarLayout(true);

  // Small helper to handle date range filter on applicationDeadline
  const isWithinDeadlineRange = (dateValue, range) => {
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
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
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

  useEffect(() => {
    const fetchPendingUsers = async () => {
      const res = await axios.get(`${import.meta.env.VITE_backend_URL}/api/users?pending=true`, { withCredentials: true });
      setPendingUsers(res.data); // useState for pendingUsers
    };
    fetchPendingUsers();
  }, []);

  const handleAcceptUser = async (userId) => {
    await axios.patch(`${import.meta.env.VITE_backend_URL}/api/signup/approve/${userId}`, {}, { withCredentials: true });
    setPendingUsers(users => users.filter(u => u._id !== userId));
  };

  const handleRejectUser = async (userId) => {
    await axios.patch(`${import.meta.env.VITE_backend_URL}/api/signup/reject/${userId}`, {}, { withCredentials: true });
    setPendingUsers(users => users.filter(u => u._id !== userId));
  };

  // Fetch all jobs from the admin endpoint (with optional filters)
  const fetchJobs = async ({
    status = statusFilter,
    location = locationFilter,
    type = typeFilter,
    deadline = deadlineRange,
  } = {}) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (location) params.append('location', location);
      if (type) params.append('employmentType', type);
      // We’ll keep deadlineRange as a purely frontend filter (no need to change backend).
      const query = params.toString();
      const url =
        `${import.meta.env.VITE_backend_URL}/api/jobs/admin` +
        (query ? `?${query}` : '');

      const res = await axios.get(url, { withCredentials: true });

      // Apply deadline range filtering on the client
      const allJobs = Array.isArray(res.data) ? res.data : [];
      const filtered = allJobs.filter((job) =>
        isWithinDeadlineRange(job.applicationDeadline, deadline)
      );

      setJobs(filtered);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      setError('Failed to load admin network data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter form submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchJobs({
      status: statusFilter,
      location: locationFilter,
      type: typeFilter,
      deadline: deadlineRange,
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setLocationFilter('');
    setTypeFilter('');
    setDeadlineRange('');
    fetchJobs({
      status: '',
      location: '',
      type: '',
      deadline: '',
    });
  };

  // Copy Application URL to clipboard
  const copyToClipboard = async (value, id) => {
    try {
      if (!value) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedJobId(id);
      setTimeout(() => setCopiedJobId(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Accept: update job status to "active"
  const handleAccept = async (jobId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/jobs/admin/${jobId}/status`,
        { status: 'active' },
        { withCredentials: true }
      );
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job._id === jobId ? res.data.data : job))
      );
    } catch (err) {
      console.error('Error accepting job:', err);
      setError('Failed to accept job.');
    }
  };

  // Reject: delete the job from the database
  const handleReject = async (jobId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_backend_URL}/api/jobs/admin/${jobId}`,
        { withCredentials: true }
      );
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error('Error rejecting job:', err);
      setError('Failed to reject job.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 font-medium">
            Loading Admin Network data...
          </p>
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
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setSelectedTab('profiles')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${selectedTab === 'profiles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Profiles
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('jobs')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${selectedTab === 'jobs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Jobs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'profiles' && (
          <div className="min-h-[200px] py-6">
  {pendingUsers && pendingUsers.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pendingUsers.map((user, idx) => (
        <div
          key={user._id}
          className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col animate-fade-in"
          style={{
            animationDelay: `${idx * 60}ms`,
            animationFillMode: 'both'
          }}
        >
          {/* Header: Name + Role */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-700 truncate">
                {user.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600 truncate">
                {user.email}
                {user.role ? ` • ${user.role}` : ''}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
              <p><span className="font-semibold">Phone:</span> {user.phone || '-'}</p>
              <p><span className="font-semibold">DOB:</span> {user.dob ? new Date(user.dob).toLocaleDateString() : '-'}</p>
              <p><span className="font-semibold">Branch:</span> {user.branchCode || '-'}</p>
              <p><span className="font-semibold">Batch:</span> {user.batch || '-'}</p>
              <p><span className="font-semibold">PRN:</span> {user.PRN || '-'}</p>
              <p><span className="font-semibold">Current Company:</span> {user.currentCompany || '-'}</p>
              <p><span className="font-semibold">Current Role:</span> {user.currentCompanyRole || '-'}</p>
              <p><span className="font-semibold">Location:</span> {user.location || '-'}</p>
              <p><span className="font-semibold">Home Town:</span> {user.homeTown || '-'}</p>
              {user.socialLinks && (
                <>
                  <p><span className="font-semibold">LinkedIn:</span> {user.socialLinks.linkedIn || '-'}</p>
                  <p><span className="font-semibold">Instagram:</span> {user.socialLinks.instagram || '-'}</p>
                  <p><span className="font-semibold">GitHub:</span> {user.socialLinks.github || '-'}</p>
                  <p><span className="font-semibold">Twitter:</span> {user.socialLinks.twitter || '-'}</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap gap-2">
            <button
              onClick={() => handleAcceptUser(user._id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition flex-1"
            >
              Accept
            </button>
            <button
              onClick={() => handleRejectUser(user._id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex-1"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex items-center justify-center text-gray-400 text-lg h-full">
      No pending alumni to display.
    </div>
  )}
</div>
        )}

        {/* Jobs Tab */}
        {selectedTab === 'jobs' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-2">
              {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Admin Job Opportunities
              </h1> */}
              {/* <span className="text-gray-500 text-sm">
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
              </span> */}
            </div>

            {/* 🔹 Filters (responsive, similar to AdminDonations) */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Filter:</h2>

                <form
                  onSubmit={handleFilterSubmit}
                  className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm"
                >
                  {/* Status */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="filled">Filled</option>
                    <option value="expired">Expired</option>
                  </select>

                  {/* Location */}
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Filter by location"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                  />

                  {/* Job Type / Employment Type */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                  >
                    <option value="">All Job Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>

                  {/* Application Deadline Range */}
                  <select
                    value={deadlineRange}
                    onChange={(e) => setDeadlineRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-44"
                  >
                    <option value="">All Deadlines</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>

                  {/* 🔹 Always show Apply / Clear buttons (keeps it usable) */}
                  <button
                    type="submit"
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </form>

              </div>
              <div className="text-gray-500 text-sm flex items-center mt-2 md:mt-0 h-full">
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
              </div>
            </section>

            {jobs.length === 0 ? (
              <p className="text-gray-600 text-center">No job opportunities found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                  >
                    {/* Header: Job Title + Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {job.title || 'Untitled Job'}
                        </h2>
                        {job.company && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {job.company}
                            {job.location ? ` • ${job.location}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <JobStatusPill status={job.status} />
                      </div>
                    </div>

                    {/* Tag / Employment Type */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {job.employmentType && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                          {job.employmentType}
                        </span>
                      )}
                      {job.tag && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">
                          {job.tag}
                        </span>
                      )}
                    </div>

                    {/* Details Box (like donation cards) */}
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 mb-4">
                      {/* Contact / Email (if present) */}
                      {job.contactEmail && (
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Mail className="mt-0.5 text-gray-500" size={16} />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Contact Email</p>
                            <p className="font-medium break-all">
                              {job.contactEmail}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Amount / Salary + Deadline */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-3">
                        {job.salary && (
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <Wallet className="mt-0.5 text-gray-500" size={16} />
                            <div>
                              <p className="text-xs text-gray-500">
                                Salary / Stipend
                              </p>
                              <p className="font-semibold text-gray-900">
                                {job.salary}
                              </p>
                            </div>
                          </div>
                        )}

                        {job.applicationDeadline && (
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <CalendarDays
                              className="mt-0.5 text-gray-500"
                              size={16}
                            />
                            <div>
                              <p className="text-xs text-gray-500">
                                Application Deadline
                              </p>
                              <p className="font-medium">
                                {new Date(
                                  job.applicationDeadline
                                ).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Application URL */}
                      {job.applicationUrl && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Application URL
                          </p>
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm text-blue-700 underline break-all">
                              {job.applicationUrl}
                            </p>
                            <a
                              href={job.applicationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 inline-flex items-center justify-center rounded-md p-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                              title="Open application link"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(job.applicationUrl, job._id)
                              }
                              className={`shrink-0 inline-flex items-center justify-center rounded-md p-1.5 border text-xs transition ${copiedJobId === job._id
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              title={
                                copiedJobId === job._id
                                  ? 'Copied'
                                  : 'Copy application URL'
                              }
                              aria-label={
                                copiedJobId === job._id
                                  ? 'Copied'
                                  : 'Copy application URL'
                              }
                            >
                              {copiedJobId === job._id ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {job.description && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                            {job.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-wrap gap-2">
                      {job.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAccept(job._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition flex-1"
                          >
                            <CheckCircle2 size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(job._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(job._id)}
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
          </>
        )}
      </div>
    </Layout>
  );
};

// Status pill styled similar to AdminDonations
const JobStatusPill = ({ status }) => {
  let bgClass = '';
  let textClass = '';
  let displayStatus = status || 'unknown';

  switch (status) {
    case 'pending':
      bgClass = 'bg-yellow-100';
      textClass = 'text-yellow-800';
      break;
    case 'active':
      bgClass = 'bg-green-100';
      textClass = 'text-green-800';
      break;
    case 'filled':
      bgClass = 'bg-blue-100';
      textClass = 'text-blue-800';
      break;
    case 'expired':
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

export default AdminNetwork;