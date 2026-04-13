import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/common/Layout';
import Donation from '../../components/donations/Donation';
import Funding from '../../components/donations/Funding';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../../utils/toast';
import { Download, Eye } from 'lucide-react'; // ✅ CHANGED (added Eye)

const Donations = () => {
  useSidebarLayout(true);

  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState(null); // 'student' | 'alumni' | null
  const [loadingRole, setLoadingRole] = useState(true);

  const [myDonations, setMyDonations] = useState([]);
  const [loadingMyDonations, setLoadingMyDonations] = useState(false);
  const [myDonationsError, setMyDonationsError] = useState('');

  const toastShownRef = useRef(false);

  useEffect(() => {
    const shouldShowDonationToast = Boolean(location.state?.showDonationSubmittedToast);
    const shouldShowFundingToast = Boolean(location.state?.showFundingSubmittedToast);

    if (!shouldShowDonationToast && !shouldShowFundingToast) return;

    if (toastShownRef.current) {
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    toastShownRef.current = true;

    if (shouldShowDonationToast) {
      showSuccessToast('Donation details submitted successfully. Your payment will be verified soon.');
    }

    if (shouldShowFundingToast) {
      showSuccessToast(
        'Funding request submitted successfully. It will be visible to alumni after admin approval.'
      );
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [
    location.pathname,
    location.state?.showDonationSubmittedToast,
    location.state?.showFundingSubmittedToast,
    navigate
  ]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/auth/profile`, {
          withCredentials: true
        });
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

  useEffect(() => {
    const fetchMyDonations = async () => {
      setMyDonationsError('');
      setLoadingMyDonations(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/api/donations/me`, {
          withCredentials: true
        });
        setMyDonations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const msg = err.response?.data?.message || 'Unable to load your transactions.';
        setMyDonationsError(msg);
      } finally {
        setLoadingMyDonations(false);
      }
    };

    if (userRole === 'alumni') fetchMyDonations();
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

  // ✅ download via backend (fixes Cloudinary 401 + keeps privacy)
  const downloadCertificate = async (donationId) => {
    try {
      const apiUrl = `${import.meta.env.VITE_backend_URL}/api/donations/${donationId}/certificate`;

      const res = await fetch(apiUrl, { credentials: 'include' });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message || 'Failed to get certificate URL');
      }

      const data = await res.json();
      if (!data?.url) throw new Error('Certificate URL not available');

      // ✅ trigger download via navigation (no CORS credentials problem)
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
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

  // ✅ Transactions = pending + rejected (approved are shown separately in Completed Transactions)
  const txAll = isAlumni
    ? myDonations.filter((d) => d.status === 'pending' || d.status === 'rejected')
    : [];

  const completedTxAll = isAlumni
    ? myDonations.filter((d) => d.status === 'accepted' && d.certificateUrl)
    : [];

  // ✅ show only latest 3 (backend already sorts newest-first)
  const tx = txAll.slice(0, 3);
  const completedTx = completedTxAll.slice(0, 3);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Role‑specific header */}
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

        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {/* Left column: alumni‑only donation card OR student‑only info card */}
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

          {/* Right column: Funding preview */}
          <div className="h-full flex flex-col">
            <Funding preview={true} />
          </div>
        </div>

        {/* ✅ Alumni-only Transactions section (hidden for students) */}
        {isAlumni && (
          <div className="mt-10 space-y-10">
            {/* ================= Transactions (Pending + Rejected) ================= */}
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
                          {/* Mobile = card; Desktop = row */}
                          <div className="rounded-xl bg-gray-50/60 md:bg-transparent p-4 md:p-0">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                              {/* Sr No */}
                              <div className="md:col-span-1 md:text-center">
                                <p className="text-sm font-semibold text-gray-900">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">Sr. No.:</span>
                                  {idx + 1}
                                </p>
                              </div>

                              {/* Date */}
                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-medium">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">Date:</span>
                                  {formatDate(d.paymentDate)}
                                </p>
                              </div>

                              {/* Purpose */}
                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold capitalize">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">Purpose:</span>
                                  {d.purpose || 'general'}
                                </p>
                              </div>

                              {/* Amount */}
                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-900 font-semibold">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">Amount:</span>
                                  ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                                </p>
                              </div>

                              {/* UTR */}
                              <div className="md:col-span-2 md:text-center">
                                <p className="text-sm text-gray-700 font-medium break-all">
                                  <span className="md:hidden text-gray-500 font-medium mr-2">UTR No.:</span>
                                  {d.utrNo || 'N/A'}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="md:col-span-1 md:text-center">
                                <div className="md:flex md:justify-center">
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${chipClass}`}>
                                    {isRejected ? 'Rejected' : 'Pending'}
                                  </span>
                                </div>
                              </div>

                              {/* Payment Proof */}
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

            {/* ================= Completed Transactions ================= */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Completed Transactions</h2>
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
                                <span className="md:hidden text-gray-500 font-medium mr-2">Sr. No.:</span>
                                {idx + 1}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-medium">
                                <span className="md:hidden text-gray-500 font-medium mr-2">Date:</span>
                                {formatDate(d.paymentDate)}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold capitalize">
                                <span className="md:hidden text-gray-500 font-medium mr-2">Purpose:</span>
                                {d.purpose || 'general'}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-900 font-semibold">
                                <span className="md:hidden text-gray-500 font-medium mr-2">Amount:</span>
                                ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="md:col-span-2 md:text-center">
                              <p className="text-sm text-gray-700 font-medium break-all">
                                <span className="md:hidden text-gray-500 font-medium mr-2">Certificate No.:</span>
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
      </div>
    </Layout>
  );
};

export default Donations;