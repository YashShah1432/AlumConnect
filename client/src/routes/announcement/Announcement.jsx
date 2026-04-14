//// filepath: d:\Major Project Changes\12-04-2026\client\src\routes\announcement\Announcement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import {Calendar, MapPin, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const Announcement = () => {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Alumni ke liye 'Add Achievement' button dikhane ka state
  const [isAlumni, setIsAlumni] = useState(false);

  // Tabs: 'events' | 'achievements'  — default is events
  const [selectedTab, setSelectedTab] = useState('events');

  useSidebarLayout(true);

useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_backend_URL}/api/announcements`
      );

      const items = response.data || [];

      // Separate events and achievements
      const eventAnnouncements = items.filter((item) => item.type === 'event');
      const achievementItems = items.filter(
        (item) => item.type === 'achievement'
      );

      // Keep only today + upcoming events (like AllEvents.jsx)
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcomingEvents = eventAnnouncements.filter((event) => {
        if (!event.eventDateTime) return false;
        const eventDate = new Date(event.eventDateTime);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
      });

      // Store ALL of them for tabs
      setAnnouncements(upcomingEvents);
      setAchievements(achievementItems);
    } catch (err) {
      console.error('Error fetching announcements:', err.message);
      setError('Failed to load announcements');
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
      const role = res.data?.role?.toLowerCase?.() || '';
      setIsAlumni(role === 'alumni');
    } catch (err) {
      console.error('Error fetching user role for announcements:', err);
      setIsAlumni(false);
    }
  };

  fetchAnnouncements();
  fetchUserRole();
}, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse font-medium text-blue-600">Loading content...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center font-medium">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setSelectedTab('events')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm sm:text-base font-medium
                ${
                  selectedTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Events
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('achievements')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm sm:text-base font-medium
                ${
                  selectedTab === 'achievements'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Achievements
            </button>
          </nav>
        </div>

        {/* ====== Events Tab Panel ====== */}
        {selectedTab === 'events' && (
          <section className="space-y-8">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                No events available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {announcements.map((announcement, index) => (
                  <div
                    key={announcement._id}
                    className="relative bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden
                               hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 80}ms both`,
                    }}
                  >

                    {announcement.imageUrl && (
                      <div className="w-full h-52 overflow-hidden">
                        <img
                          src={announcement.imageUrl}
                          alt={announcement.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      </div>
                    )}

                    <div className="p-5 sm:p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                            Event
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {announcement.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {announcement.description}
                      </p>

                      {/* Extra info: date/time and venue, styled similar to fields */}
                      <div className="mt-1 text-xs sm:text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                        <span>
                          <span className="font-medium text-gray-700">Date & Time:</span>{' '}
                          {announcement.eventDateTime
                            ? new Date(announcement.eventDateTime).toLocaleString('en-GB')
                            : 'No date/time provided'}
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">Venue:</span>{' '}
                          {announcement.venue || 'No venue provided'}
                        </span>
                      </div>
                    </div>

                    {/* Subtle gradient hover overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-blue-50/60 via-transparent to-transparent" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ====== Achievements Tab Panel ====== */}
        {selectedTab === 'achievements' && (
          <section className="space-y-6">
            {/* Alumni‑only button just below tabs, above cards (mobile + desktop) */}
            {isAlumni && (
              <div className="flex justify-start">
                <Link
                  to="/create-achievement"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md"
                >
                  <PlusCircle size={18} /> Add Achievement
                </Link>
              </div>
            )}

            {achievements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                No achievements to display.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement._id}
                    className="relative bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden
                               hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 80}ms both`,
                    }}
                  >

                    <div className="p-5 sm:p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar / image */}
                        {achievement.imageUrl ? (
                          <div className="relative">
                            <img
                              src={achievement.imageUrl}
                              alt={achievement.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-purple-200
                                         transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                                          flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-inner">
                            {achievement.name?.charAt(0) || 'A'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                              Achievement
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {achievement.name || 'Achievement'}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>

                      {/* Extra info: name, batch, branch, date */}
                      <div className="mt-1 text-xs sm:text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                        <span>
                          <span className="font-medium text-gray-700">Name:</span>{' '}
                          {achievement.name || 'N/A'}
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">Batch:</span>{' '}
                          {achievement.batch || 'N/A'}
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">Branch:</span>{' '}
                          {achievement.branch || 'N/A'}
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">Date:</span>{' '}
                          {achievement.createdAt
                            ? new Date(achievement.createdAt).toLocaleDateString('en-GB')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Subtle gradient hover overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-purple-50/60 via-transparent to-transparent" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Announcement;