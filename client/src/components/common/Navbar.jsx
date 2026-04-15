import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, LogOut, User, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import WITLogo from "../../../assets/WIT_logo.png";
import { toast } from 'react-toastify';
import { handleLogout } from '../../utils/authUtils';

// Import context and components
import { useUser } from '../../context/UserContext';
import { useMessage } from '../../context/MessageContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ThemeToggle';
import MessagePopup from '../messaging/MessagePopup';
import socketService from '../../services/socketService';

const Navbar = () => {
  // State management
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, setUser } = useUser();
  const { unreadCount } = useMessage();

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Clear menu when changing pages
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Logout handler
  const logoutUser = () => {
    try {
      // Disconnect socket on logout
      socketService.disconnect();
      
      // Logout and navigate
      handleLogout(navigate, setUser);
      
      // Optional: Show success toast
      toast.success('Logged out successfully');
    } catch (error) {
      // Handle logout errors
      toast.error('Logout failed. Please try again.');
      console.error('Logout error:', error);
    }
  };

  // Toggle message popup
  const toggleMessagePopup = () => {
    setIsMessagePopupOpen(!isMessagePopupOpen);
  };

  // Profile menu toggle handler
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Avatar URL generator
  const getAvatarUrl = (size = 40) => {
    if (!user || !user.name) {
      return `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=${size}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&size=${size}`;
  };

  // Outside click handler for profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <>
      <nav className="bg-white/92 dark:bg-gray-900/92 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700 px-6 py-3 flex justify-between items-center fixed top-0 w-full z-50 shadow-sm dark:shadow-xl">
        {/* Left side - Logo and College Name */}
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <img src={WITLogo} alt="WIT Solapur Logo" className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg leading-tight">
              {isSmallScreen ? "WIT-Solapur" : "WIT Solapur"}
            </span>
            {!isSmallScreen && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">Walchand Institute of Technology</span>
            )}
          </div>
        </div>

        {/* Right side - Notifications, DMs, Profile */}
        <div className="flex items-center">
          {/* Notifications */}
          <button className="p-2 mx-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative transition-all duration-200 cursor-pointer">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
              3
            </span>
          </button>
          
          {/* Messages */}
          <button 
            onClick={toggleMessagePopup} 
            className="p-2 mx-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative transition-all duration-200 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <div className="relative profile-menu ml-4">
            <button 
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ) : (
                <img
                  src={getAvatarUrl(32)}
                  alt="Profile"
                  className="w-8 h-8 rounded-full ring-1 ring-blue-100 dark:ring-blue-900"
                />
              )}
              {!isSmallScreen && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">{user?.name?.split(' ')[0] || 'User'}</span>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-72 bg-white/98 dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-2xl py-2 z-50 transform transition-all duration-200 ease-out border border-gray-200 dark:border-gray-700 backdrop-blur-xl">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl(48)}
                        alt="Profile"
                        className="w-12 h-12 rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                      />
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-white truncate">
                          {user?.name || 'User'}
                        </h3>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {user?.role || 'Student'}
                          </span>
                          <p className="text-gray-500 dark:text-gray-400 text-xs ml-1 truncate">{user?.email || 'No email available'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu Options */}
                <div className="px-2 py-2">
                  {/* Show 'My Profile' only for student and alumni */}
                  {user?.role !== 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium text-sm">My Profile</span>
                    </button>
                  )}
                  
                  <button
                    onClick={logoutUser}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Message Popup */}
      <MessagePopup 
        open={isMessagePopupOpen} 
        onClose={() => setIsMessagePopupOpen(false)} 
      />
    </>
  );
};

export default Navbar;
