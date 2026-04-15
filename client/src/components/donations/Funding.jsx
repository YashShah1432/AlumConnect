// src/components/donations/Funding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

//
// Single Funding Card
// Shows name, comments, Show More toggle, amount, batch/email, and tags if needed
//
const FundingCard = ({ 
  name = 'Untitled', 
  batch = '', 
  email = '', 
  purpose = '', 
  amount = 0, 
  comments = '',
  // Optional: if you have tags, you can pass them in an array
  tags = []
}) => {
  const [expanded, setExpanded] = useState(false);

  // Decide how many characters to show before toggling
  const MAX_CHAR = 100;
  const isLong = comments.length > MAX_CHAR;

  // If not expanded, clamp the text
  const displayedComments = expanded ? comments : comments.slice(0, MAX_CHAR);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
      {/* Title / Name */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
        {name}
      </h2>

      {/* Main text / comments */}
      {comments && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {displayedComments}
          {!expanded && isLong && '...'}
        </p>
      )}

      {/* Show More / Show Less toggle (only if text is long) */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 dark:text-blue-400 text-sm mb-2 focus:outline-none hover:text-blue-700 dark:hover:text-blue-300"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}

      {/* Bottom row: amount on left, batch/email on right */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-blue-600 dark:text-blue-400 font-medium">₹{amount}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {batch || email || 'Unknown'}
        </span>
      </div>

      {/* If you have tags, show them below */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

//
// Main Funding component
// Fetches accepted donations from /api/donations and displays them in cards
//
const Funding = ({ preview = false, filter }) => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
   const [userRole, setUserRole] = useState(null); // 'student' | 'alumni' | null

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        let url = `${import.meta.env.VITE_backend_URL}/api/donations`;
        // If you want to apply filters in non-preview mode, append query params
        if (filter && !preview) {
          const queryParams = new URLSearchParams();
          if (filter.category) queryParams.append('category', filter.category);
          if (filter.search) queryParams.append('search', filter.search);
          url += '?' + queryParams.toString();
        }

        const response = await axios.get(url, { withCredentials: true });
        setOpportunities(response.data);
      } catch (err) {
        console.error('Error fetching funding opportunities:', err);
        setError('Error loading funding opportunities');
      } finally {
        setLoading(false);
      }
    };
    
    // NEW: fetch current user profile to check role
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_backend_URL}/auth/profile`,
          { withCredentials: true }
        );
        // assuming backend returns something like { role: 'student' | 'alumni' }
        setUserRole(res.data.role || null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserRole(null);
      }
    };

    fetchOpportunities();
    fetchUserRole();
  }, [filter, preview]);

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-gray-600 dark:text-gray-400 shadow-sm dark:shadow-lg">Loading funding opportunities...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">{error}</div>;
  }

  // If preview mode, limit the list to 2 items
  const displayedRequests = preview ? opportunities.slice(0, 2) : opportunities;

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Boost Start-Up Culture</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Discover active requests and help promising student ideas move forward.</p>
        </div>
        {preview && (
          <button
            onClick={() => navigate('/donation/opportunities')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            View All →
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Banner or highlight section */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
              Invest in College Startups and Projects
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Support innovative ideas from your alma mater's entrepreneurs.
            </p>
          </div>
        </div>

        {/* Funding Cards */}
        <div className="space-y-4">
          <div className="grid gap-4">
            {displayedRequests.map((request) => (
              <FundingCard
                key={request._id}
                // Map your donation fields to FundingCard props
                name={request.name}
                batch={request.batch}
                email={request.email}
                purpose={request.purpose}
                amount={request.amount}
                comments={request.comments}
                // If you have tags, pass them in an array
                // tags={request.tags || []}
              />
            ))}
          </div>

          <div className="flex justify-center md:justify-between items-center mt-6">
            {/* Show button ONLY if user is a student */}
          {userRole === 'student' && (
            <button
              onClick={() => navigate('/donation/create-funding-request')}
              className="bg-green-600 dark:bg-green-600 text-white px-10 py-3 md:px-4 md:py-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-700 shadow-sm"
            >
              Create your own Request!
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funding;
