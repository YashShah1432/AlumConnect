import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProfileCard from './ProfileCard';
import MessagePopup from '../messaging/MessagePopup';   // ⬅️ IMPORT POPUP
import { useUser } from '../../context/UserContext';    // optional: to block if not logged in
import { showErrorToast } from '../../utils/toast';     // if you already have this util

const People = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [selectedUserForChat, setSelectedUserForChat] = useState(null);

  const navigate = useNavigate();
  const { user } = useUser(); // current logged-in user

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_backend_URL}/api/alumni`);
        const alumniData = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setAlumni(alumniData);
        setLoading(false);
      } catch (err) {
        setError('Error fetching alumni profiles');
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const handleMessageClick = (profile) => {
    // Optional: prevent messaging if not logged in
    if (!user) {
      showErrorToast('You must be logged in to send messages.');
      return;
    }

    const userObj = {
      _id: profile.userId || profile._id,  // adjust based on your schema
      name: profile.name,
      email: profile.email,
      profilePicture: profile.profilePicture,
    };

    setSelectedUserForChat(userObj);
    setIsMessagePopupOpen(true);
  };

  // Exclude current logged‑in user from list
  const filteredAlumni = user
    ? alumni.filter((a) => {
        const alumId = a.userId || a._id;
        // user.id is from auth/profile; adapt if you store _id instead
        return alumId?.toString() !== user.id?.toString();
      })
    : alumni;

  const previewAlumni = filteredAlumni.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Connect and Connect</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {previewAlumni.map((profile) => (
          <ProfileCard
            key={profile._id}
            profile={profile}
            onMessageClick={handleMessageClick}
          />
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => navigate('/network/all-people')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          View All
        </button>
      </div>

      {/* Messaging popup anchored here */}
      <MessagePopup
        open={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        initialUser={selectedUserForChat}
      />
    </div>
  );
};

export default People;