import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import SocialLinks from '../../components/profile/SocialLinks';
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
  PhoneIcon,
  BookOpenIcon,
  IdCardIcon,
  BuildingIcon,
  BriefcaseIcon,
  MapPinIcon,
  HomeIcon,
} from 'lucide-react';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const JOB_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Contract', value: 'contract' },
  { label: 'Freelance', value: 'freelance' },
];

const DATE_FILTER_OPTIONS = [
  { label: 'Anytime', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
  { label: 'This year', value: 'year' },
];

function isWithinDateRange(dateString, range) {
  if (!dateString || !range) return true;
  const date = new Date(dateString);
  const now = new Date();
  switch (range) {
    case 'today':
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    case 'week': {
      // Get start of week (Monday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      // Get end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return date >= startOfWeek && date <= endOfWeek;
    }
    case 'month':
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    case 'year':
      return date.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

const AdminNetwork = () => {
  const [selectedTab, setSelectedTab] = useState('profiles');
  const [pendingUsers, setPendingUsers] = useState([]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedJobId, setCopiedJobId] = useState(null);

  // Profiles tab filters
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Jobs tab filters
  const [jobStatusFilter, setJobStatusFilter] = useState('');
  const [jobRoleTypeFilter, setJobRoleTypeFilter] = useState('');
  const [jobDeadlineFilter, setJobDeadlineFilter] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  useSidebarLayout(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      const res = await axios.get(`${import.meta.env.VITE_backend_URL}/api/users?pending=true`, { withCredentials: true });
      setPendingUsers(res.data);
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

  // Fetch all jobs (no filters)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const url = `${import.meta.env.VITE_backend_URL}/api/jobs/admin`;
      const res = await axios.get(url, { withCredentials: true });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      setError('Failed to load admin network data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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

  // Profiles tab filtering
  const filteredUsers = pendingUsers.filter(user => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (branchFilter && user.branchCode !== branchFilter) return false;
    if (batchFilter && String(user.batch) !== String(batchFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(q);
      const prnMatch = user.PRN?.toString().includes(q);
      if (!nameMatch && !prnMatch) return false;
    }
    return true;
  });

  // Jobs tab filtering
  const filteredJobs = jobs.filter(job => {
    // Status filter
    if (jobStatusFilter && job.status !== jobStatusFilter) return false;
    // Role type filter (employmentType)
    if (jobRoleTypeFilter && job.employmentType !== jobRoleTypeFilter) return false;
    // Application deadline filter (relative)
    if (jobDeadlineFilter && !isWithinDateRange(job.applicationDeadline, jobDeadlineFilter)) return false;
    // Location filter
    if (jobLocationFilter && (!job.location || !job.location.toLowerCase().includes(jobLocationFilter.toLowerCase()))) return false;
    // Search bar (job role or company name)
    if (jobSearchQuery) {
      const q = jobSearchQuery.toLowerCase();
      const roleMatch = job.title?.toLowerCase().includes(q);
      const companyMatch = job.company?.toLowerCase().includes(q);
      if (!roleMatch && !companyMatch) return false;
    }
    return true;
  });

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
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Filter:</h2>
                <form
                  onSubmit={e => { e.preventDefault(); }}
                  className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm"
                >
                  {/* Role */}
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  >
                    <option value="">All Roles</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                  {/* Branch */}
                  <input
                    type="text"
                    value={branchFilter}
                    onChange={e => setBranchFilter(e.target.value)}
                    placeholder="Branch"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  />
                  {/* Batch */}
                  <input
                    type="text"
                    value={batchFilter}
                    onChange={e => setBatchFilter(e.target.value)}
                    placeholder="Batch"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  />
                  {/* Search */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search Name or PRN"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-44"
                  />
                  {/* Clear */}
                  <button
                    type="button"
                    onClick={() => {
                      setRoleFilter('');
                      setBranchFilter('');
                      setBatchFilter('');
                      setSearchQuery('');
                    }}
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </form>
              </div>
              <div className="text-gray-500 text-sm flex items-center mt-2 md:mt-0 h-full">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'profile' : 'profiles'} found
              </div>
            </section>
            {filteredUsers && filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user, idx) => (
                  <div
                    key={user._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col animate-fade-in"
                    style={{
                      animationDelay: `${idx * 60}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {/* Header: Name + Role */}
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="min-w-0 ml-1">
                        <h3 className="text-xl font-bold text-blue-700 truncate flex items-center gap-2">
                          {user.name}
                          {user.role === 'alumni' && <CheckCircle2 className="text-gray-500" size={18} title="Alumni" />}
                          {user.role === 'student'}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-600 truncate flex items-center gap-1">
                          <Mail size={14} className="text-gray-500" /> {user.email}
                          <span className="mx-1 text-gray-500 text-base text-xl">•</span>
                          <span className="capitalize">{user.role}</span>
                        </p>
                      </div>
                    </div>

                    {/* Details grid with icons */}
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2 text-sm text-gray-700">
                        <p className="flex items-center gap-1">
                          <PhoneIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Phone:</span> {user.phone || '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <CalendarDays size={16} className="text-gray-500" />
                          <span className="font-semibold">DOB:</span> {user.dob ? new Date(user.dob).toLocaleDateString('en-GB') : '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <BookOpenIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Branch:</span> {user.branchCode || '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Copy size={16} className="text-gray-500" />
                          <span className="font-semibold">Batch:</span> {user.batch || '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <IdCardIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">PRN:</span> {user.PRN || '-'}
                        </p>
                        <p className="flex items-center gap-1">
                          <HomeIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Home Town:</span> {user.homeTown || '-'}
                        </p>

                        {/* Divider: full row */}
                        <hr className="col-span-full my-2 border-gray-200" />

                        {/* Place these three at the end, each taking full width */}
                        <p className="flex items-center gap-2 col-span-full">
                          <BuildingIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Current Company:</span> {user.currentCompany || '-'}
                        </p>
                        <p className="flex items-center gap-2 col-span-full">
                          <BriefcaseIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Current Role:</span> {user.currentCompanyRole || '-'}
                        </p>
                        <p className="flex items-center gap-2 col-span-full">
                          <MapPinIcon size={16} className="text-gray-500" />
                          <span className="font-semibold">Current Location:</span> {user.location || '-'}
                        </p>
                      </div>
                      {/* Divider: full row */}
                      <hr className="col-span-full my-2 border-gray-200" />
                      {/* Social icons row, full width */}
                      {user.socialLinks && (
                        <div className="flex justify-center">
                          <SocialLinks socialLinks={user.socialLinks} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAcceptUser(user._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition flex-1"
                      >
                        <CheckCircle2 size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectUser(user._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex-1"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-lg h-full">
                No pending profiles to display.
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {selectedTab === 'jobs' && (
          <>
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Filter:</h2>
                <form
                  onSubmit={e => { e.preventDefault(); }}
                  className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm"
                >
                  {/* Job Status */}
                  <select
                    value={jobStatusFilter}
                    onChange={e => setJobStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="filled">Filled</option>
                    <option value="expired">Expired</option>
                  </select>
                  {/* Role Type */}
                  <select
                    value={jobRoleTypeFilter}
                    onChange={e => setJobRoleTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  >
                    {JOB_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {/* Application Deadline */}
                  <select
                    value={jobDeadlineFilter}
                    onChange={e => setJobDeadlineFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-40"
                  >
                    {DATE_FILTER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {/* Location */}
                  <input
                    type="text"
                    value={jobLocationFilter}
                    onChange={e => setJobLocationFilter(e.target.value)}
                    placeholder="Location"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-32"
                  />
                  {/* Search */}
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={e => setJobSearchQuery(e.target.value)}
                    placeholder="Search Role or Company"
                    className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-44"
                  />
                  {/* Clear */}
                  <button
                    type="button"
                    onClick={() => {
                      setJobStatusFilter('');
                      setJobRoleTypeFilter('');
                      setJobDeadlineFilter('');
                      setJobLocationFilter('');
                      setJobSearchQuery('');
                    }}
                    className="px-3 py-2 text-[11px] sm:text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </form>
              </div>
              <div className="text-gray-500 text-sm flex items-center mt-2 md:mt-0 h-full">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
              </div>
            </section>

            {filteredJobs.length === 0 ? (
              <p className="text-gray-600 text-center">No job opportunities found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, idx) => (
                  <div
                    key={job._id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col animate-fade-in"
                    style={{
                      animationDelay: `${idx * 60}ms`,
                      animationFillMode: 'both'
                    }}
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

                    {/* Details Box */}
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