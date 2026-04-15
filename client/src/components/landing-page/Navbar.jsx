import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WITLogo from "../../../assets/WIT_logo.png";
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/#top');
    } else {
      const el = document.getElementById('top');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleNavClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const desktopLinkClass =
    "relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full";

  return (
    <nav className="bg-white/92 dark:bg-gray-900/92 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700 px-4 sm:px-6 py-3 flex justify-between items-center fixed top-0 w-full z-50 shadow-sm dark:shadow-xl">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 space-x-3">
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <img src={WITLogo} alt="WIT Solapur Logo" className="w-8 h-8" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-blue-600 dark:text-blue-400 font-semibold text-base sm:text-lg">
            {isSmallScreen ? "WIT-Solapur" : "WIT Solapur"}
          </span>
          {!isSmallScreen && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">Walchand Institute of Technology</span>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8 flex-1 justify-end">
        <ul className="flex items-center space-x-8">
          <li>
            <button type="button" onClick={handleHomeClick} className={desktopLinkClass}>
              Home
            </button>
          </li>
          <li>
            <button type="button" onClick={() => handleNavClick('benefit')} className={desktopLinkClass}>
              Benefits
            </button>
          </li>
          <li>
            <button type="button" onClick={() => handleNavClick('about')} className={desktopLinkClass}>
              About
            </button>
          </li>
          <li>
            <button type="button" onClick={() => handleNavClick('contact')} className={desktopLinkClass}>
              Contact
            </button>
          </li>
        </ul>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden flex items-center space-x-2">
        <ThemeToggle />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[67px] bg-white/98 dark:bg-gray-900/98 border-t border-gray-200 dark:border-gray-700 z-40 max-h-[calc(100vh-56px)] overflow-y-auto backdrop-blur-xl">
          <div className="px-4 py-4 space-y-4">
            <ul className="space-y-4">
              <li>
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className="block w-full text-left text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-lg transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('benefit')}
                  className="block w-full text-left text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-lg transition-colors"
                >
                  Benefits
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('about')}
                  className="block w-full text-left text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-lg transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className="block w-full text-left text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-lg transition-colors"
                >
                  Contact
                </button>
              </li>

              <li className="pt-2 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="text-center px-4 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-center px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
