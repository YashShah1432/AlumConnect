////jsx
// filepath: d:\Major Project Changes\12-04-2026\client\src\routes\network\Network.jsx
import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AllAlumni from './AllAlumni';
import AllJobs from './AllJobs';

const Network = () => {
  useSidebarLayout(true);
  const navigate = useNavigate();

  // Tabs: 'alumni' | 'jobs'
  const [selectedTab, setSelectedTab] = useState('alumni');

  const handleCreateJobClick = () => {
    navigate('/network/create-job');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setSelectedTab('alumni')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm sm:text-base font-medium
                ${
                  selectedTab === 'alumni'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Alumni
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('jobs')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm sm:text-base font-medium
                ${
                  selectedTab === 'jobs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Jobs
            </button>
          </nav>
        </div>

        {/* Create Job button – Jobs tab only, below tabs, above job cards */}
        {selectedTab === 'jobs' && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleCreateJobClick}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md"
            >
              <PlusCircle size={18} /> Create Job Opportunity
            </button>
          </div>
        )}

        {/* Alumni Tab Content – full list with filters */}
        {selectedTab === 'alumni' && (
          <section className="space-y-6">
            <AllAlumni embedMode />
          </section>
        )}

        {/* Jobs Tab Content – full list with filters */}
        {selectedTab === 'jobs' && (
          <section className="space-y-6">
            <AllJobs embedMode />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Network;