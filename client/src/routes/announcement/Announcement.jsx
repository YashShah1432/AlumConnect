import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/common/Layout';
import { ArrowRight, Calendar, MapPin, PlusCircle } from 'lucide-react';
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

  useSidebarLayout(true);

useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_backend_URL}/api/announcements`);
      console.log("API Response:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from server');
      }

      // Separate events & achievements
      const allEvents = response.data.filter(item => item.type === 'event');
      const achievementItems = response.data.filter(item => item.type === 'achievement');

      // Keep only today's and upcoming events
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize

      const upcomingEvents = allEvents.filter(evt => {
        if (!evt.eventDateTime) return false;
        const eventDate = new Date(evt.eventDateTime);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today; // today or future
      });

      console.log("Upcoming Events (for homepage):", upcomingEvents);
      console.log("Achievements:", achievementItems);

      // Show only first 3 upcoming events for homepage
      setAnnouncements(upcomingEvents.slice(0, 3));
      setAchievements(achievementItems.slice(0, 4));
    } catch (err) {
      console.error('Error fetching announcements:', err.message);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    // ...existing code unchanged...
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
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-xl text-center font-medium border border-red-200 dark:border-red-800">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12 bg-transparent min-h-screen">
        {/* Announcements Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Events</h2>
            <Link
              to="/announcements/all-events"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View all events <ArrowRight size={18} />
            </Link>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-8 text-center text-gray-500 dark:text-gray-400">
              No events available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg overflow-hidden hover:shadow-md dark:hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700"
                >
                  {/* If there's an imageUrl, show the image */}
                  {announcement.imageUrl && (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                        Event
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-normal leading-relaxed mb-4">
                      {announcement.description}
                    </p>

                    {/* Dynamic DateTime */}
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar size={16} className="mr-2" />
                      <span>
                        {announcement.eventDateTime
                          ? new Date(announcement.eventDateTime).toLocaleString('en-GB')
                          : "No date/time provided"}
                      </span>
                    </div>

                    {/* Dynamic Venue or fallback */}
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2">
                      <MapPin size={16} className="mr-2" />
                      <span>
                        {announcement.venue || "No venue provided"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Achievements</h2>
            <div className="flex gap-4">
              {/* Show "Add Achievement" button only to alumni */}
              {isAlumni && (
                <Link
                  to="/create-achievement"
                  className="hidden min-[550px]:inline-flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-sm font-medium shadow-md dark:shadow-lg"
                >
                  <PlusCircle size={18} /> Add Achievement
                </Link>
              )}
              <Link
                to="/announcements/all-achievements"
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                View all achievements <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {achievements.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-8 text-center text-gray-500 dark:text-gray-400">
              No achievements to display.
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {achievements.map((achievement) => (
                <div
                  key={achievement._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg p-6 hover:shadow-md dark:hover:shadow-xl transition-all duration-300 border border-gray-50 dark:border-gray-700"
                >
                  <div className="flex items-center gap-5">
                    {achievement.imageUrl ? (
                      <img
                        src={achievement.imageUrl}
                        alt={achievement.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-purple-100 dark:border-purple-900"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-500 dark:text-purple-400 font-bold text-2xl">
                        {achievement.name?.charAt(0) || "A"}
                      </div>
                    )}
                    <div>
                      <div className="mb-2">
                        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full text-xs font-medium">
                          Achievement
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile / <550px: Add Achievement below cards, centered */}
              {isAlumni && (
                <div className="mt-8 flex justify-center min-[550px]:hidden">
                  <Link
                    to="/create-achievement"
                    className="inline-flex items-center gap-2 bg-green-600 dark:bg-green-700 text-white px-16 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-sm font-medium shadow-md dark:shadow-lg"
                  >
                    <PlusCircle size={18} /> Add Achievement
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Announcement;
