////jsx
// filepath: d:\Major Project Changes\12-04-2026\client\src\routes\network\AllAlumni.jsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/common/Layout';
import ProfileCard from '../../components/network/ProfileCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/common/Pagination';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import MessagePopup from '../../components/messaging/MessagePopup';
import { useUser } from '../../context/UserContext';
import { showErrorToast } from '../../utils/toast';

const AllAlumni = ({ embedMode = false }) => {
  // Search state
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  // Filters
  const [batch, setBatch] = useState('');
  const [branch, setBranch] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [location, setLocation] = useState('');

  // Data + pagination
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState(null);
  const { user } = useUser();

  const navigate = useNavigate();

  useSidebarLayout(true);

  // Fetch alumni whenever page changes
  useEffect(() => {
    fetchAlumni(page);
  }, [page]);

  // Debounced suggestions for name search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (name.trim() !== '') {
        axios
          .get(
            `${import.meta.env.VITE_backend_URL}/api/alumni/suggestions?name=${name}`
          )
          .then((res) => setSuggestions(res.data))
          .catch((err) =>
            console.error('Error fetching suggestions', err)
          );
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [name]);

  const fetchAlumni = async (pageNum = 1, extraFilters = {}) => {
    try {
      const filters = {
        name,
        batch,
        branch,
        currentCompany,
        location,
        ...extraFilters,
      };

      const queryParams = new URLSearchParams({
        page: pageNum,
        limit,
        ...filters,
      }).toString();

      const res = await axios.get(
        `${import.meta.env.VITE_backend_URL}/api/alumni?${queryParams}`
      );
      setAlumni(res.data.data);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const executeSearch = (extraFilters = {}) => {
    setSuggestions([]);
    if (searchInputRef.current) searchInputRef.current.blur();
    setPage(1);
    fetchAlumni(1, extraFilters);
  };

  const handleSuggestionClick = (suggestedName) => {
    setSuggestions([]);
    setName(suggestedName);
    executeSearch({ name: suggestedName });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleClearSearch = () => {
    setName('');
    setSuggestions([]);
    executeSearch({ name: '' });
  };

  const handleClearFilters = () => {
    setBatch('');
    setBranch('');
    setCurrentCompany('');
    setLocation('');
    executeSearch({
      batch: '',
      branch: '',
      currentCompany: '',
      location: '',
    });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

  const handleMessageClick = (profile) => {
    if (!user) {
      showErrorToast('You must be logged in to send messages.');
      return;
    }

    const userObj = {
      _id: profile.userId || profile._id,
      name: profile.name,
      email: profile.email,
      profilePicture: profile.profilePicture,
    };

    setSelectedUserForChat(userObj);
    setIsMessagePopupOpen(true);
  };

  const visibleAlumni = user
    ? alumni.filter((alum) => {
        const alumId = alum.userId || alum._id;
        return alumId?.toString() !== user.id?.toString();
      })
    : alumni;

  const content = (
    <div className="max-w-7xl mx-auto">
      {/* Back Button – only when used as a standalone page */}
      {!embedMode && (
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate('/network')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded shadow hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>
      )}
        <div>
        {/* Search + Filters in a single responsive row */}
        <div className="mb-6 flex flex-col md:flex-row md:items-stretch gap-4">
          {/* Search by Name styled like filters (no label) */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              ref={searchInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Search by name"
              className="px-3 py-2 border rounded text-sm w-full pr-10"
            />
            {name && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full text-gray-600 hover:text-gray-800 text-lg px-2 py-0"
              >
                ×
              </button>
            )}
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded shadow z-10">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion._id}
                    onMouseDown={() =>
                      handleSuggestionClick(suggestion.name)
                    }
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filters – responsive, wrap nicely on mobile */}
          <form
            onSubmit={handleFilterSubmit}
            className="flex flex-wrap gap-3 w-full"
          >
            <div className="w-[48%] min-w-[140px] sm:w-[48%] md:flex-1 md:min-w-[120px] md:max-w-[160px]">
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch (e.g. 2022)"
                className="px-3 py-2 border rounded text-sm w-full"
              />
            </div>

            <div className="w-[48%] min-w-[140px] sm:w-[48%] md:flex-1 md:min-w-[120px] md:max-w-[160px]">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="px-3 py-2 border rounded text-sm w-full"
              >
                <option value="">Branch (All)</option>
                <option value="CSE">CSE</option>
                <option value="CSD">CSD</option>
                <option value="CSH">CSH</option>
                <option value="CSA">CSA</option>
                <option value="ECE">ECE</option>
                <option value="ECI">ECI</option>
              </select>
            </div>

            <div className="w-[48%] min-w-[160px] sm:w-[48%] md:flex-1 md:min-w-[160px]">
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="Current company"
                className="px-3 py-2 border rounded text-sm w-full"
              />
            </div>

            <div className="w-[48%] min-w-[140px] sm:w-[48%] md:flex-1 md:min-w-[140px]">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="px-3 py-2 border rounded text-sm w-full"
              />
            </div>

            {/* Buttons row – full width on mobile, shrink on larger screens */}
            <div className="flex w-full sm:w-auto gap-2 items-stretch">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alumni grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleAlumni &&
          visibleAlumni.map((alum) => (
            <ProfileCard
              key={alum._id}
              profile={alum}
              onMessageClick={handleMessageClick}
            />
          ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <MessagePopup
        open={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        initialUser={selectedUserForChat}
      />
    </div>
  );

  if (embedMode) return content;

  return <Layout>{content}</Layout>;
};

export default AllAlumni;