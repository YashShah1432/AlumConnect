//// filepath: d:\Major Project Changes\12-04-2026\client\src\routes\donation\Donations.jsx
// client/src/routes/donation/Donations.jsx
import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../components/common/Layout';
import Donation from '../../components/donations/Donation';
import Funding from '../../components/donations/Funding';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { Eye, Download } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

const Donations = () => {
  useSidebarLayout(true);

  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null); // 'student' | 'alumni' | null
  const [loadingRole, setLoadingRole] = useState(true);

  const [myDonations, setMyDonations] = useState([]);
  const [loadingMyDonations, setLoadingMyDonations] = useState(false);
  const [myDonationsError, setMyDonationsError] = useState('');

  const [myRequests, setMyRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [myRequestsError, setMyRequestsError] = useState('');

  const [fundedOpportunityIds, setFundedOpportunityIds] = useState([]);

  const toastShownRef = useRef(false);

  // Handle toast messages after redirect from create forms
  useEffect(() => {
    const shouldShowDonationToast = Boolean(location.state?.showDonationSubmittedToast);
    const shouldShowFundingToast = Boolean(location.state?.showFundingSubmittedToast);

    if (!shouldShowDonationToast && !shouldShowFundingToast) return;

    if (toastShownRef.current) return;
    toastShownRef.current = true;

    if (shouldShowDonationToast) {
      showSuccessToast('Donation details submitted successfully. It will be verified by admin.');
    }

    if (shouldShowFundingToast) {
      showSuccessToast('Funding request submitted successfully. It will be reviewed by admin.');
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [
    location.pathname,
    location.state?.showDonationSubmittedToast,
    location.state?.showFundingSubmittedToast,
    navigate
  ]);

  // Fetch current user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_backend_URL}/auth/profile`,
          { withCredentials: true }
        );
        setUserRole(res.data.role || null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserRole(null);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, []);

  // Fetch alumni's own donations
  useEffect(() => {
    const fetchMyDonations = async () => {
      setMyDonationsError('');
      setLoadingMyDonations(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_backend_URL}/api/donations/me`,
          { withCredentials: true }
        );
        setMyDonations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching my donations:', err);
        const msg =
          err.response?.data?.message || 'Unable to load your transactions.';
        setMyDonationsError(msg);
      } finally {
        setLoadingMyDonations(false);
      }
    };

    if (userRole === 'alumni') {
      fetchMyDonations();
    }
  }, [userRole]);

  // Fetch student's own funding requests + funded opportunities
  // Fetch student's own funding requests + funded opportunities
  useEffect(() => {
    const fetchMyRequests = async () => {
      setMyRequestsError('');
      setLoadingMyRequests(true);
      try {
        const [reqRes, fundedRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_backend_URL}/api/opportunities/me`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_backend_URL}/api/donations/funded-opportunities`,
            { withCredentials: true }
          )
        ]);

        setMyRequests(Array.isArray(reqRes.data) ? reqRes.data : []);

        const fundedIds =
          fundedRes.data?.fundedOpportunityIds?.map((id) => String(id)) || [];
        setFundedOpportunityIds(fundedIds);
      } catch (err) {
        console.error('Error fetching my requests or funded opportunities:', err);

        // Graceful message for 404 (route not found) or generic error
        const status = err.response?.status;
        const msg =
          status === 404
            ? 'Funding request tracking is temporarily unavailable. Please try again later.'
            : err.response?.data?.message ||
            'Unable to load your funding requests. Please try again later.';

        setMyRequestsError(msg);
      } finally {
        setLoadingMyRequests(false);
      }
    };

    if (userRole === 'student') {
      fetchMyRequests();
    }
  }, [userRole]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  const openInNewTab = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Download certificate via backend
  const downloadCertificate = async (donationId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_backend_URL}/api/donations/${donationId}/certificate`,
        { withCredentials: true }
      );
      const url = res.data?.url;
      if (!url) {
        showErrorToast('Download link not available.');
        return;
      }
      window.location.href = url;
    } catch (e) {
      console.error('Error downloading certificate:', e);
      const msg =
        e.response?.data?.message || 'Error downloading certificate. Please try again.';
      showErrorToast(msg);
    }
  };

  if (loadingRole) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  const isAlumni = userRole === 'alumni';
  const isStudent = userRole === 'student';

  const showDonationCard = isAlumni;
  const gridCols = showDonationCard ? 'md:grid-cols-2' : 'md:grid-cols-1';

  // Alumni transactions
  const txAll = isAlumni
    ? myDonations.filter((d) => d.status === 'pending' || d.status === 'rejected')
    : [];

  const completedTxAll = isAlumni
    ? myDonations.filter((d) => d.status === 'accepted' && d.certificateUrl)
    : [];

  const tx = txAll.slice(0, 3);
  const completedTx = completedTxAll.slice(0, 3);

  // Student funding requests
  const reqAll = isStudent ? myRequests : [];


  // Second card: approved requests that also have an accepted donation
  const fundedSet = new Set(fundedOpportunityIds.map((id) => String(id)));

  const myFundedRequestsAll = isStudent
    ? reqAll.filter(
      (r) =>
        r.status === 'approved' &&
        r._id &&
        fundedSet.has(String(r._id))
    )
    : [];

  // First card: all requests EXCEPT those already in "funded"
  // (i.e. hide approved+funded from "My Funding Requests")
  const myRequestsForFirstCard = isStudent
    ? reqAll.filter(
        (r) =>
          !(
            r.status === 'approved' &&
            r._id &&
            fundedSet.has(String(r._id))
          )
      )
    : [];


  const reqFirstSection = myRequestsForFirstCard.slice(0, 3);
  const reqFundedSection = myFundedRequestsAll.slice(0, 3);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Role-specific header */}
        <div className="text-center mt-6 mb-4">
          {isAlumni && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Support Innovation at Your Alma Mater
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mt-2">
                As an alumnus of our college, your contribution directly powers student
                startups, research prototypes, hackathons and social impact projects.
                Help the next generation of engineers and innovators build what you
                once dreamed of building here.
              </p>
            </>
          )}

          {isStudent && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Turn Your Idea Into a Campus Reality
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mt-2">
                Use the Alum‑Connect funding platform to raise support for your
                startup, research, innovation or patent work. Alumni across the
                globe are ready to back strong ideas coming out of our campus.
              </p>
            </>
          )}

          {!isAlumni && !isStudent && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Support Our Institution
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mt-2">
                Join our community of supporters in strengthening innovation,
                entrepreneurship and research culture at our college.
              </p>
            </>
          )}

          <div className="w-12 h-1 bg-blue-600 mx-auto mt-3 rounded-full" />
        </div>

        {/* Top grid: Donation or student info + Funding preview */}
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {isAlumni && (
            <div className="h-full flex flex-col">
              <Donation />
            </div>
          )}

          {isStudent && (
            <div className="h-full flex flex-col">
              <div className="h-full bg-white rounded-lg shadow-md p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  How Alumni Funding Helps Your Project
                </h2>
                <p className="text-gray-700 mb-3">
                  Alum‑Connect links your ideas with alumni who care about the
                  institute&apos;s startup and research culture. Use this space to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 text-sm">
                  <li>Raise seed support for your student startup or product prototype.</li>
                  <li>Get backing for research projects, conference travel or proof‑of‑concepts.</li>
                  <li>Seek funding for innovation challenges, hackathons or patent filing.</li>
                </ul>
                <p className="text-gray-700 text-sm">
                  Create a clear funding request explaining your problem, solution,
                  impact on campus and estimated budget. Approved requests will be
                  visible to alumni under Funding Opportunities.
                </p>
              </div>
            </div>
          )}

          <div className="h-full flex flex-col">
            <Funding preview={true} />
          </div>
        </div>

        {/* Alumni-only Transactions */}
        {isAlumni && (
          <div className="mt-10 space-y-10">
            {/* Transactions (Pending + Rejected) */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h2>
              </div>

              {loadingMyDonations ? (
                <div className="p-6">
                  <p className="text-gray-600">Loading your transactions...</p>
                </div>
              ) : myDonationsError ? (
                <div className="p-6">
                  <p className="text-red-600">{myDonationsError}</p>
                </div>
              ) : tx.length === 0 ? (
                <div className="p-6">
                  <p className="text-gray-600">No transactions.</p>
                </div>
              ) : (
                <>
                  {/* Desktop header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                    <div className="col-span-1 text-center">Sr. No.</div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Purpose</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-2 text-center">UTR No.</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-center">Payment Proof</div>
                  </div>

                  <ul className="divide-y">
                    {tx.map((d, idx) => {
                      const isRejected = d.status === 'rejected';
                      const chipClass = isRejected
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-yellow-50 text-yellow-800 border border-yellow-200';

                      return (
                        <li key={d._id} className="px-5 sm:px-6 py-4">
                          <div className="rounded-xl bg-gray-50/60 md:bg-transparent p-4 md:p-0">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                              <div className="md:col-span-1 md:text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Sr. No.:
                                  </span>
                                  {idx + 1}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-medium">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Date:
                                  </span>
                                  {formatDate(d.paymentDate)}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold capitalize">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Purpose:
                                  </span>
                                  {d.purpose || 'general'}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Amount:
                                  </span>
                                  ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-700 font-medium break-all">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    UTR No.:
                                  </span>
                                  {d.utrNo || 'N/A'}
                                </p>
                              </div>

                              <div className="md:col-span-1 md:text-center">
                                <div className="md:flex md:justify-center">
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${chipClass}`}
                                  >
                                    {isRejected ? 'Rejected' : 'Pending'}
                                  </span>
                                </div>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <button
                                  type="button"
                                  onClick={() => openInNewTab(d.paymentProofUrl)}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition px-3 py-2 text-sm font-semibold w-full md:w-auto md:min-w-[110px]"
                                  title="View payment proof"
                                  disabled={!d.paymentProofUrl}
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>

            {/* Completed Transactions */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Completed Transactions
                </h2>
              </div>

              {loadingMyDonations ? (
                <div className="p-6">
                  <p className="text-gray-600">Loading your transactions...</p>
                </div>
              ) : completedTx.length === 0 ? (
                <div className="p-6">
                  <p className="text-gray-600">No completed transactions yet.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                    <div className="col-span-1 text-center">Sr. No.</div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Purpose</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-2 text-center">Certificate No.</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-center">Download</div>
                  </div>

                  <ul className="divide-y">
                    {completedTx.map((d, idx) => (
                      <li key={d._id} className="px-5 sm:px-6 py-4">
                        <div className="rounded-xl bg-gray-50/60 md:bg-transparent p-4 md:p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                            <div className="md:col-span-1 md:text-center">
                              <p className="text-sm font-semibold text-gray-900">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Sr. No.:
                                </span>
                                {idx + 1}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-medium">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Date:
                                </span>
                                {formatDate(d.paymentDate)}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold capitalize">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Purpose:
                                </span>
                                {d.purpose || 'general'}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Amount:
                                </span>
                                ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-700 font-medium break-all">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Certificate No.:
                                </span>
                                {d.certificateNo || '—'}
                              </p>
                            </div>

                            <div className="md:col-span-1 md:text-center">
                              <div className="md:flex md:justify-center">
                                <span className="inline-flex items-center rounded-full bg-green-50 text-green-800 border border-green-200 px-3 py-1 text-xs font-semibold">
                                  Approved
                                </span>
                              </div>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <button
                                type="button"
                                onClick={() => downloadCertificate(d._id)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition px-3 py-2 text-sm font-semibold w-full md:w-auto md:min-w-[110px]"
                                title="Download Tax Exemption Certificate (PDF)"
                                disabled={!(d.certificateUrl || d.certificatePublicId)}
                              >
                                <Download size={16} />
                                PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}

        {/* Student-only Funding Request Transactions */}
        {isStudent && (
          <div className="mt-10 space-y-10">
            {/* My Funding Requests (all statuses) */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-yellow-50 to-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  My Funding Requests
                </h2>
              </div>

              {loadingMyRequests ? (
                <div className="p-6">
                  <p className="text-gray-600">Loading your funding requests...</p>
                </div>
              ) : myRequestsError ? (
                <div className="p-6">
                  <p className="text-red-600">{myRequestsError}</p>
                </div>
              ) : reqFirstSection.length === 0 ? (
                <div className="p-6">
                  <p className="text-gray-600">
                    You have not created any funding requests yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                    <div className="col-span-1 text-center">Sr. No.</div>
                    <div className="col-span-2 text-center">Created On</div>
                    <div className="col-span-3 text-center">Project Title</div>
                    <div className="col-span-2 text-center">Category</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                  </div>

                  <ul className="divide-y">
                    {reqFirstSection.map((r, idx) => {
                      const isRejected = r.status === 'rejected';
                      const isApproved = r.status === 'approved';

                      let chipClass =
                        'bg-yellow-50 text-yellow-800 border border-yellow-200';
                      let chipLabel = 'Pending';

                      if (isRejected) {
                        chipClass =
                          'bg-red-50 text-red-700 border border-red-200';
                        chipLabel = 'Rejected';
                      } else if (isApproved) {
                        chipClass =
                          'bg-green-50 text-green-800 border border-green-200';
                        chipLabel = 'Approved';
                      }

                      return (
                        <li key={r._id} className="px-5 sm:px-6 py-4">
                          <div className="rounded-xl bg-gray-50/60 md:bg-transparent p-4 md:p-0">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                              <div className="md:col-span-1 md:text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Sr. No.:
                                  </span>
                                  {idx + 1}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-medium">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Created On:
                                  </span>
                                  {formatDate(r.createdAt)}
                                </p>
                              </div>

                              <div className="md:col-span-3 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold break-words">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Project Title:
                                  </span>
                                  {r.title || 'Untitled Project'}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold capitalize">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Category:
                                  </span>
                                  {r.category || 'general'}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">
                                    Amount:
                                  </span>
                                  ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                                </p>
                              </div>

                              <div className="md:col-span-2 md:text-center">
                                <div className="md:flex md:justify-center">
                                  <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${chipClass}`}
                                  >
                                    {chipLabel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {r.details && (
                              <div className="mt-3 md:hidden">
                                <p className="text-xs text-gray-500 mb-1">
                                  Description:
                                </p>
                                <p className="text-sm text-gray-700 line-clamp-3">
                                  {r.details}
                                </p>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>

            {/* Funded Requests (Donation Received) */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Funded Requests (Donation Received)
                </h2>
              </div>

              {loadingMyRequests ? (
                <div className="p-6">
                  <p className="text-gray-600">Loading your funding requests...</p>
                </div>
              ) : myRequestsError ? (
                <div className="p-6">
                  <p className="text-red-600">{myRequestsError}</p>
                </div>
              ) : reqFundedSection.length === 0 ? (
                <div className="p-6">
                  <p className="text-gray-600">
                    No funding request has received an approved donation yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-600">
                    <div className="col-span-1 text-center">Sr. No.</div>
                    <div className="col-span-2 text-center">Created On</div>
                    <div className="col-span-3 text-center">Project Title</div>
                    <div className="col-span-2 text-center">Category</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                  </div>

                  <ul className="divide-y">
                    {reqFundedSection.map((r, idx) => (
                      <li key={r._id} className="px-5 sm:px-6 py-4">
                        <div className="rounded-xl bg-gray-50/60 md:bg-transparent p-4 md:p-0">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                            <div className="md:col-span-1 md:text-center">
                              <p className="text-sm font-semibold text-gray-900">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Sr. No.:
                                </span>
                                {idx + 1}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-medium">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Created On:
                                </span>
                                {formatDate(r.createdAt)}
                              </p>
                            </div>

                            <div className="md:col-span-3 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold break-words">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Project Title:
                                </span>
                                {r.title || 'Untitled Project'}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold capitalize">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Category:
                                </span>
                                {r.category || 'general'}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold">
                                <span className="md:hidden text-gray-500 font-medium mr-2">
                                  Amount:
                                </span>
                                ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <div className="md:flex md:justify-center">
                                <span className="inline-flex items-center rounded-full bg-green-50 text-green-800 border border-green-200 px-3 py-1 text-xs font-semibold">
                                  Funded
                                </span>
                              </div>
                            </div>
                          </div>

                          {r.details && (
                            <div className="mt-3 md:hidden">
                              <p className="text-xs text-gray-500 mb-1">
                                Description:
                              </p>
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {r.details}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Donations;