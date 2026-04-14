////jsx
// filepath: d:\Major Project Changes\12-04-2026\client\src\components\donations\Funding.jsx
// src/components/donations/Funding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

//
// Single Funding Card
// Shows name, comments, Show More toggle, amount, payment date, and purpose
//
const FundingCard = ({ 
  name = 'Untitled', 
  batch = '', 
  email = '', 
  purpose = '', 
  amount = 0, 
  comments = '',
  paymentDate = '',
  // Optional: if you have tags, you can pass them in an array
  tags = []
}) => {
  const [expanded, setExpanded] = useState(false);

  // Decide how many characters to show before toggling
  const MAX_CHAR = 100;
  const isLong = comments.length > MAX_CHAR;

  // If not expanded, clamp the text
  const displayedComments = expanded ? comments : comments.slice(0, MAX_CHAR);

  // Format date as dd/mm/yyyy
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB');
  };

  return (
    <div className="border border-gray-200 rounded p-4 shadow-md hover:shadow-lg transition-shadow">
      {/* Title / Name + Purpose chip on same row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {name}
        </h2>

        {purpose && (
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
            {purpose}
          </span>
        )}
      </div>

      {/* Main text / comments */}
      {comments && (
        <p className="text-sm text-gray-600 mb-2">
          {displayedComments}
          {!expanded && isLong && '...'}
        </p>
      )}

      {/* Show More / Show Less toggle (only if text is long) */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm mb-2 focus:outline-none"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}

      {/* Bottom row: amount on left, payment date on right */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-blue-600 font-medium">₹{amount}</span>
        <span className="text-gray-500 text-sm text-right">
          {formatDate(paymentDate)}
        </span>
      </div>

      {/* If you have tags, show them below */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

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

        // Optional filters for non-preview mode
        if (filter && !preview) {
          const queryParams = new URLSearchParams();
          if (filter.category) queryParams.append('category', filter.category);
          if (filter.search) queryParams.append('search', filter.search);
          url += '?' + queryParams.toString();
        }

        // In preview, call API without credentials to avoid intermittent auth failures
        const config = preview ? {} : { withCredentials: true };

        const response = await axios.get(url, config);
        setOpportunities(Array.isArray(response.data) ? response.data : []);
        setError('');
      } catch (err) {
        console.error('Error fetching funding opportunities:', err);
        setOpportunities([]);
        setError(
          preview
            ? 'Unable to load latest alumni contributions right now.'
            : 'Error loading funding opportunities'
        );
      } finally {
        setLoading(false);
      }
    };

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
      }
    };

    setLoading(true);
    setError('');
    fetchOpportunities();
    fetchUserRole();
  }, [filter, preview]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // In preview: render the card but show a subtle text message instead of a red error block
  if (error && preview) {
    return (
      <div className="h-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Boost Start-Up Culture</h2>
          {preview && (
            <button
              onClick={() => navigate('/donation/opportunities')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Invest in College Startups and Projects
              </h3>
              <p className="text-gray-700">
                Support innovative ideas from your alma mater&apos;s entrepreneurs.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Non-preview: keep existing red error message behaviour
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  // If preview mode, limit the list to 2 items
  const displayedRequests = preview ? opportunities.slice(0, 2) : opportunities;

  return (
    <div className="h-full bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Boost Start-Up Culture</h2>
        {preview && (
          <button
            onClick={() => navigate('/donation/opportunities')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Banner or highlight section */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Invest in College Startups and Projects
            </h3>
            <p className="text-gray-700">
              Support innovative ideas from your alma mater&apos;s entrepreneurs.
              Alumni contributions help students validate prototypes and turn
              early‑stage concepts into real products.
            </p>
          </div>
        </div>

        {/* Funding Cards */}
        <div className="space-y-4">
          {/* NOTE: layout unchanged (no 3-column change) */}
          <div className="grid gap-4">
            {displayedRequests.map((request) => (
              <FundingCard
                key={request._id}
                name={request.name}
                batch={request.batch}
                email={request.email}
                purpose={request.purpose}
                amount={request.amount}
                comments={request.comments}
                paymentDate={request.paymentDate}
              />
            ))}
          </div>

          <div className="flex justify-center md:justify-between items-center mt-6">
            {userRole === 'student' && (
              <button
                onClick={() => navigate('/donation/create-funding-request')}
                className="bg-green-600 text-white px-10 py-3 md:px-4 md:py-2 rounded-lg hover:bg-green-700"
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