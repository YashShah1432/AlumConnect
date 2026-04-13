import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const handleScrollTop = () => {
    // small timeout so it also works when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  // ✅ Underline slide animation (same style approach as Navbar)
  const footerLinkClass =
    "relative text-gray-300 hover:text-white transition-colors " +
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all " +
    "hover:after:w-full";

  return (
    <footer className="bg-gray-800">
      <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Top: brand + links in one row (stack on small screens) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand / text */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300 font-semibold">
              AlumConnect
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Connecting alumni with their alma mater and peers.
            </p>
          </div>

          {/* Single row of links */}
          <nav className="flex justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  onClick={handleScrollTop}
                  className={footerLinkClass}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  onClick={handleScrollTop}
                  className={footerLinkClass}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  onClick={handleScrollTop}
                  className={footerLinkClass}
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom: copyright */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            &copy; 2025-2026 AlumConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;