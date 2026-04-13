import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { Mail, Wallet, CalendarDays, GraduationCap, User } from 'lucide-react';

const FundingOpportunities = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]); // accepted alumni donations
  const [opportunities, setOpportunities] = useState([]); // accepted student funding requests
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useSidebarLayout(true);

  // ✅ Date format: day first then month (dd/mm/yyyy)
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_backend_URL}/auth/profile`, {
          withCredentials: true,
        });
        setCurrentUserRole(res.data.role || null);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setCurrentUserRole(null);
      } finally {
        setRoleLoading(false);
      }
    };

    const fetchData = async () => {
      try {
        const [donRes, oppRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_backend_URL}/api/donations`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_backend_URL}/api/opportunities`, {
            withCredentials: true,
          }),
        ]);

        setDonations(donRes.data || []);

        const acceptedOpps = (oppRes.data || []).filter(
          (o) => o.status === 'approved' || o.status === 'accepted'
        );

        setOpportunities(acceptedOpps);
      } catch (err) {
        console.error('Error fetching funding opportunities:', err);
        setError('Failed to load funding opportunities.');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
    fetchData();
  }, []);

  if ((loading || roleLoading) && !error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 font-medium">Loading funding opportunities...</p>
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

  const isStudent = currentUserRole === 'student';

  // For students: hide any donation created by a student (safety)
  const visibleDonations = isStudent
    ? donations.filter((d) => d.userRole !== 'student')
    : donations;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Back Button */}
        <div className="flex justify-start mb-2">
          <button
            type="button"
            onClick={() => navigate('/donation')}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Funding Opportunities</h1>
          {isStudent ? (
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              See how alumni are investing in the campus innovation ecosystem. These contributions
              strengthen labs, clubs and student‑led initiatives across the institute.
            </p>
          ) : (
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Explore how you can support student startups, research projects and innovation teams
              through transparent, institute‑verified opportunities.
            </p>
          )}
        </div>

        {/* =========================
    Section 1: Alumni Contributions
   ========================= */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alumni Contributions</h2>
          {visibleDonations.length === 0 ? (
            <p className="text-gray-600 text-center">No alumni donations available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {donation.userName || donation.email || 'Unknown Alumni'}
                      </h3>
                    </div>
                  </div>

                  {/* Purpose badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
                      {donation.purpose || 'general'}
                    </span>
                  </div>

                  {/* Details box */}
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 mb-4">
                    {/* ✅ Email FIRST and FULL WIDTH */}
                    <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                      <Mail className="mt-0.5 text-gray-500 shrink-0" size={16} />
                      <div className="min-w-0 w-full">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium break-all">
                          {donation.email || donation.userEmail || 'N/A'}
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
                          <p className="font-medium">{formatDate(donation.paymentDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                        <GraduationCap className="mt-0.5 text-gray-500 shrink-0" size={16} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Batch</p>
                          <p className="font-medium text-gray-900 truncate">{donation.batch || 'N/A'}</p>
                        </div>
                      </div>

                      {/* ✅ removed email from here (now first + full width) */}
                    </div>

                    {donation.comments ? (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Comments</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {donation.comments}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* No Contribute button in Alumni Contributions */}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================
    Section 2: Student Funding Requests
   ========================= */}
        {!isStudent && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Student Funding Requests</h2>
            {opportunities.length === 0 ? (
              <p className="text-gray-600 text-center">No funding requests available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opp) => {
                  const donationState = opp.donationState || 'open';
                  const isLocked = donationState === 'locked';

                  const fullName =
                    opp.studentName || opp.authorName || opp.authorEmail || 'Student Team';

                  return (
                    <div
                      key={opp._id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 sm:p-6 flex flex-col"
                    >
                      {/* Header: Full Name */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {fullName}
                          </h3>
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
                        {/* ✅ Email FIRST and FULL WIDTH */}
                        <div className="flex items-start gap-2 text-sm text-gray-700 min-w-0">
                          <Mail className="mt-0.5 text-gray-500 shrink-0" size={16} />
                          <div className="min-w-0 w-full">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium break-all">{opp.authorEmail || 'N/A'}</p>
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
                            <GraduationCap className="mt-0.5 text-gray-500 shrink-0" size={16} />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Batch</p>
                              <p className="font-medium text-gray-900 truncate">{opp.batch || 'N/A'}</p>
                            </div>
                          </div>

                          {/* ✅ removed email from here (now first + full width) */}
                        </div>

                        {/* Project title stays here, above details */}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Project Title</p>
                          <p className="text-sm font-semibold text-gray-900 whitespace-normal break-words">
                            {opp.title || 'Untitled Project'}
                          </p>
                        </div>

                        {opp.details ? (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Detailed Description</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {opp.details}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {isLocked && (
                        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-md px-3 py-2 mb-3">
                          Donation in progress for this request.
                        </p>
                      )}

                      <div className="mt-auto pt-2">
                        <button
                          disabled={isLocked}
                          onClick={() =>
                            navigate('/donation/process', {
                              state: {
                                lockedAmount: opp.amount ?? '',
                                lockedPurpose: opp.category ?? '',
                                opportunityId: opp._id,
                              },
                            })
                          }
                          className={`w-full sm:w-auto inline-flex items-center justify-center text-white text-sm px-4 py-2 rounded-lg transition ${isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                          {isLocked ? 'Locked' : 'Contribute'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default FundingOpportunities;