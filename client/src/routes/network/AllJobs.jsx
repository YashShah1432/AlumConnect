////jsx
// filepath: d:\Major Project Changes\12-04-2026\client\src\routes\network\AllJobs.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import JobCard from '../../components/network/JobCard';
import Pagination from '../../components/common/Pagination';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const AllJobs = ({ embedMode = false }) => {
  const navigate = useNavigate();

  // Filters
  const [employmentType, setEmploymentType] = useState('');
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('');
  const [keyword, setKeyword] = useState('');

  // Jobs + pagination
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  useSidebarLayout(true);

  const fetchFilteredJobs = async (pageNum = 1, filters = {}) => {
  setLoading(true);
  try {
    const effectiveEmploymentType =
      filters.employmentType !== undefined
        ? filters.employmentType
        : employmentType;
    const effectiveLocation =
      filters.location !== undefined ? filters.location : location;
    const effectiveTag =
      filters.tag !== undefined ? filters.tag : tag;
    const effectiveKeyword =
      filters.keyword !== undefined ? filters.keyword : keyword;

    const queryParams = new URLSearchParams();
    if (effectiveEmploymentType)
      queryParams.append('employmentType', effectiveEmploymentType);
    if (effectiveLocation)
      queryParams.append('location', effectiveLocation);
    if (effectiveTag) queryParams.append('tag', effectiveTag);
    if (effectiveKeyword)
      queryParams.append('keyword', effectiveKeyword);

    // Only active jobs
    queryParams.append('status', 'active');
    queryParams.append('page', pageNum);
    queryParams.append('limit', limit);

    const url = `${
      import.meta.env.VITE_backend_URL
    }/api/jobs/filter?${queryParams.toString()}`;

    const response = await axios.get(url);

    // Defensive checks against unexpected response
    const data = response.data || {};
    const list = Array.isArray(data.data) ? data.data : [];
    const currentPage = Number.isFinite(data.page) ? data.page : pageNum;
    const pages = Number.isFinite(data.pages) ? data.pages : 1;

    setJobs(list);
    setPage(currentPage);
    setTotalPages(pages);
    setError('');
  } catch (err) {
    console.error('Error fetching jobs:', err?.response?.data || err);
    setError(err?.response?.data?.message || 'Error fetching jobs');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchFilteredJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchFilteredJobs(1);
  };

  const handleClearFilters = () => {
    setEmploymentType('');
    setLocation('');
    setTag('');
    setKeyword('');
    fetchFilteredJobs(1, {
      employmentType: '',
      location: '',
      tag: '',
      keyword: '',
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchFilteredJobs(newPage);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setLoading(true);

      const response = await axios.patch(
        `${import.meta.env.VITE_backend_URL}/api/jobs/${jobId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      console.log('Update response:', response.data);

      if (newStatus === 'filled') {
        setJobs((prevJobs) =>
          prevJobs.filter(
            (job) =>
              job._id !== jobId &&
              job.id !== jobId &&
              job.jobId !== jobId
          )
        );
      } else {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job._id === jobId ||
            job.id === jobId ||
            job.jobId === jobId
              ? { ...job, status: newStatus }
              : job
          )
        );
      }

      alert('Job status updated successfully!');
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update job status');
      alert('Error updating job status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="max-w-7xl mx-auto">
      {/* Back Button – only standalone */}
      {!embedMode && (
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate('/network')}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>
      )}

      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {embedMode ? 'Job Opportunities' : 'All Job Opportunities'}
        </h1>
        {!embedMode && (
          <p className="text-gray-600">
            Explore all available job opportunities.
          </p>
        )}
      </div> */}

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="mb-6 flex flex-wrap gap-4"
      >
        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
        </select>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="px-3 py-2 border rounded"
        />

        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag"
          className="px-3 py-2 border rounded"
        />

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search keyword"
          className="px-3 py-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={handleClearFilters}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear All Filters
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            No jobs found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id || job.jobId || Math.random().toString()}
                {...job}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );

  if (embedMode) return content;

  return <Layout>{content}</Layout>;
};

export default AllJobs;