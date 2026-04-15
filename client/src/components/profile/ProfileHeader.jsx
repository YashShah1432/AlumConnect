/* eslint-disable react/prop-types */
// eslint-disable react/prop-types 
import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import LogoutButton from './LogoutButton';
import ProfileEditModal from './ProfileEditModal';
import axios from 'axios'; 

const ProfileHeader = ({ profile, onProfileUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSubmit = async (formData) => {
    await onProfileUpdate(formData);   // this calls handleProfileUpdate in Profile.jsx
    setIsEditModalOpen(false);         // close modal after success
  };

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D8ABC&color=fff`}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Desktop / md+ only: keep name + role next to avatar */}
          <div className="hidden sm:block sm:ml-4 mt-4 sm:mt-0 text-left">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            {profile.role && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition flex items-center shadow-sm"
          >
            <FaEdit className="mr-2" /> Edit
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Mobile-only: name + role outside avatar parent, full width */}
      <div className="block sm:hidden w-full mt-2">
        <div className="inline-flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white dark:text-white">{profile.name}</h1>
          {profile.role && (
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
          )}
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSubmit={handleEditSubmit}
      />
    </>
  );
};

export default ProfileHeader;
