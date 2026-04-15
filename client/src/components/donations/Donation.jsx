// src/components/donations/Donation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Donation = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Support Your Alma Mater</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Make a verified contribution with clear tax-benefit guidance and a simple, trustworthy donation flow.
      </p>
      
      <div className="space-y-6">
        {/* Giving Back Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/40">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Give Back to Your College</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Your contribution helps build a stronger future for the next generation of students.
            Support the institution that helped shape your career.
          </p>
        </div>

        {/* Tax Benefits Section */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-900/40">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Tax Benefits</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            All donations are eligible for tax exemption under Section 80G of the Income Tax Act.
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ College Backed Donation Receipt</li>
            <li>✓ Tax Exemption Certificate</li>
            <li>✓ Documentation Support</li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/donation/process')}
            className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors duration-200 shadow-md dark:shadow-lg"
          >
            Make a Donation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Donation;
