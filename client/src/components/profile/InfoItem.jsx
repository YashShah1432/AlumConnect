import React from 'react';

const InfoItem = ({ icon, label, value }) => {
  if (!value || value === 'null' || value === 'undefined') return null;
  
  return (
    <div className="flex items-start space-x-3 mb-4 rounded-xl bg-white dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 px-4 py-3">
      <div className="mt-1 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-gray-800 dark:text-white">{value}</div>
      </div>
    </div>
  );
};

export default InfoItem;
