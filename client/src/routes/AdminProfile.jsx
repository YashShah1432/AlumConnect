// client/src/routes/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import axios from 'axios';
import { useSidebarLayout } from '../hooks/useSidebarLayout';

const AdminProfile = () => {
  const [alumni, setAlumni] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NEW: which tab is active: 'students' | 'alumni'
  // default -> Student Profiles first
  const [selectedTab, setSelectedTab] = useState('students');

  // 🔹 NEW: filter state (shared between tabs but independent per role)
  const [studentBatchFilter, setStudentBatchFilter] = useState('');
  const [studentBranchCodeFilter, setStudentBranchCodeFilter] = useState('');
  const [alumniBatchFilter, setAlumniBatchFilter] = useState('');
  const [alumniBranchCodeFilter, setAlumniBranchCodeFilter] = useState('');

  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [alumniNameFilter, setAlumniNameFilter] = useState('');

  useSidebarLayout(true);

  // Fetch all users from /api/users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_backend_URL}/api/users`,
        {
          withCredentials: true,
        }
      );
      const users = res.data;

      // Separate into alumni vs. students
      setAlumni(users.filter((u) => u.role === 'alumni'));
      setStudents(users.filter((u) => u.role === 'student'));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler: update a student's role to alumni
  const handleMarkAsAlumni = async (userId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/users/${userId}/role`,
        { role: 'alumni' },
        { withCredentials: true }
      );
      // Refresh after update
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  // 🔹 Derived filtered lists
  const filteredStudents = students.filter((u) => {
    const nameMatch = studentNameFilter
      ? (u.name || '').toLowerCase().includes(studentNameFilter.toLowerCase())
      : true;
    const batchMatch = studentBatchFilter
      ? (u.batch || '').toLowerCase().includes(studentBatchFilter.toLowerCase())
      : true;
    const branchCodeMatch = studentBranchCodeFilter
      ? (u.branchCode || '').toLowerCase().includes(studentBranchCodeFilter.toLowerCase())
      : true;
    return nameMatch && batchMatch && branchCodeMatch;
  });

  const filteredAlumni = alumni.filter((u) => {
    const nameMatch = alumniNameFilter
      ? (u.name || '').toLowerCase().includes(alumniNameFilter.toLowerCase())
      : true;
    const batchMatch = alumniBatchFilter
      ? (u.batch || '').toLowerCase().includes(alumniBatchFilter.toLowerCase())
      : true;
    const branchCodeMatch = alumniBranchCodeFilter
      ? (u.branchCode || '').toLowerCase().includes(alumniBranchCodeFilter.toLowerCase())
      : true;
    return nameMatch && batchMatch && branchCodeMatch;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-blue-600 font-medium">Loading profiles...</p>
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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ===== Tabs Header (Students / Alumni) ===== */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setSelectedTab('students')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${selectedTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Student Profiles
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('alumni')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium
                ${selectedTab === 'alumni'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Alumni Profiles
            </button>
          </nav>
        </div>

        {/* ===== Tab Panels ===== */}

        {/* Students Tab (default) */}
        {selectedTab === 'students' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Filter:
              </h1>

              {/* 🔹 Filters (responsive) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-wrap gap-2 md:gap-3 text-sm"
              >
                <input
                  type="text"
                  value={studentNameFilter}
                  onChange={(e) => setStudentNameFilter(e.target.value)}
                  placeholder="Search by name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                <input
                  type="text"
                  value={studentBatchFilter}
                  onChange={(e) => setStudentBatchFilter(e.target.value)}
                  placeholder="Filter by batch"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                <input
                  type="text"
                  value={studentBranchCodeFilter}
                  onChange={(e) => setStudentBranchCodeFilter(e.target.value)}
                  placeholder="Filter by branch code"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                {(studentNameFilter || studentBatchFilter || studentBranchCodeFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentNameFilter('');
                      setStudentBatchFilter('');
                      setStudentBranchCodeFilter('');
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="text-gray-600">
                {students.length === 0
                  ? 'No student profiles found.'
                  : 'No students match the selected filters.'}
              </p>
            ) : (
              <>
                {/* 🔹 Mobile: card layout (no horizontal scroll) */}
                <div className="grid gap-4 md:hidden">
                  {filteredStudents.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-pop-in"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Student • {user.batch || 'Batch N/A'}
                          </p>
                        </div>
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="break-all">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Email:{' '}
                          </span>
                          {user.email}
                        </p>
                        <p>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Phone:{' '}
                          </span>
                          {user.phone || 'N/A'}
                        </p>
                        <p>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Branch:{' '}
                          </span>
                          {user.branchCode || 'N/A'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleMarkAsAlumni(user._id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Mark as Alumni
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🔹 md+ screens: table view */}
                <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
                  <table className="min-w-full table-auto border-collapse text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Phone</th>
                        <th className="px-6 py-3 font-medium">Batch</th>
                        <th className="px-6 py-3 font-medium">Branch</th>
                        <th className="px-6 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredStudents.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.batch || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.branchCode || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleMarkAsAlumni(user._id)}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-xs font-medium"
                            >
                              Mark as Alumni
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}

        {/* Alumni Tab */}
        {selectedTab === 'alumni' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Filter:
              </h1>

              {/* 🔹 Filters (responsive) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-wrap gap-2 md:gap-3 text-sm"
              >
                <input
                  type="text"
                  value={alumniNameFilter}
                  onChange={(e) => setAlumniNameFilter(e.target.value)}
                  placeholder="Search by name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                <input
                  type="text"
                  value={alumniBatchFilter}
                  onChange={(e) => setAlumniBatchFilter(e.target.value)}
                  placeholder="Filter by batch"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                <input
                  type="text"
                  value={alumniBranchCodeFilter}
                  onChange={(e) => setAlumniBranchCodeFilter(e.target.value)}
                  placeholder="Filter by branch code"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-40"
                />
                {(alumniNameFilter || alumniBatchFilter || alumniBranchCodeFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAlumniNameFilter('');
                      setAlumniBatchFilter('');
                      setAlumniBranchCodeFilter('');
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {filteredAlumni.length === 0 ? (
              <p className="text-gray-600">
                {alumni.length === 0
                  ? 'No alumni profiles found.'
                  : 'No alumni match the selected filters.'}
              </p>
            ) : (
              <>
                {/* 🔹 Mobile: card layout (no horizontal scroll) */}
                <div className="grid gap-4 md:hidden">
                  {filteredAlumni.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-pop-in"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Alumni • {user.batch || 'Batch N/A'}
                          </p>
                        </div>
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold">
                          {(user.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="break-all">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Email:{' '}
                          </span>
                          {user.email}
                        </p>
                        <p>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Phone:{' '}
                          </span>
                          {user.phone || 'N/A'}
                        </p>
                        <p>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            Branch:{' '}
                          </span>
                          {user.branchCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🔹 md+ screens: table view */}
                <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
                  <table className="min-w-full table-auto border-collapse text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Phone</th>
                        <th className="px-6 py-3 font-medium">Batch</th>
                        <th className="px-6 py-3 font-medium">Branch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredAlumni.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.batch || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {user.branchCode || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default AdminProfile;