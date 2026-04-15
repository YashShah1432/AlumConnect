import React, { useState } from 'react';
import { useUser } from '../../context/UserContext'; // Adjust the import path as needed
// import ApplyForm from './ApplyForm'; // Import the ApplyForm component

const JobCard = ({ 
  title, 
  company, 
  description, 
  location, 
  salary, 
  tags, 
  authorName, 
  requirements, 
  responsibilities, 
  status,
  jobId, 
  _id,
  authorEmail,
  onStatusChange,
  applicationDeadline,
  applicationUrl
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // const [showApplyForm, setShowApplyForm] = useState(false); // State to toggle ApplyForm
  const { user, loading } = useUser(); // Use the user context

  // Use _id if jobId is not provided (for MongoDB compatibility)
  const id = jobId || _id;
  
  // Format text with line breaks
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };
  
  // Check if the current user is the author of this job
  const isAuthor = user?.email?.toLowerCase() === authorEmail?.toLowerCase();

  // Check if the current user is an alumni
  const isAlumni = user?.role === 'alumni';

  // Handle status change with error handling
  const handleStatusChange = async () => {
    if (typeof onStatusChange !== 'function') {
      console.error('onStatusChange prop is not a function or not provided');
      alert('Unable to update job status. Please try again later.');
      return;
    }
    
    if (!id) {
      console.error('Job ID is missing');
      alert('Cannot identify this job posting. Please try again later.');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await onStatusChange(id, 'filled');
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('An error occurred while updating the job status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Show a loading state if user data is still being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // Hide card if job is not active
  if (status !== 'active') {
    return null;
  }

  // Hide card if application deadline is passed
  if (applicationDeadline) {
    const deadlineDate = new Date(applicationDeadline);
    const today = new Date();
    // remove time part for comparison
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      return null;
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      
      {/* Status indicator */}
      {status && (
        <div className={`text-xs mb-2 inline-block px-2 py-1 rounded ${
          status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
          status === 'filled' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 
          'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      )}
      
      {/* Basic information - always visible */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-blue-600 dark:text-blue-400 font-medium">{company}</span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{location}</span>
      </div>
      
      <div className="mb-3">
        <span className="text-gray-700 dark:text-gray-300 text-sm">Posted by: {authorName}</span>
        {isAuthor && <span className="ml-2 text-xs text-green-500 dark:text-green-400">(You)</span>}
      </div>
      
      {applicationDeadline && (
        <div className="mb-3">
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            Application Deadline:{' '}
            {new Date(applicationDeadline).toLocaleDateString('en-GB')}
          </span>
        </div>
      )}

      {salary && (
        <div className="mb-3">
          <span className="text-green-600 dark:text-green-400 font-medium">{salary}</span>
        </div>
      )}
      
      {/* Collapsed view of description */}
      {!expanded && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{description}</p>
      )}
      
      {/* Expanded view with full content */}
      {expanded && (
        <div className="mt-4 mb-4">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">Description:</h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
          
          {requirements && (
            <>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Requirements:</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{formatText(requirements)}</p>
            </>
          )}
          
          {responsibilities && (
            <>
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">Responsibilities:</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{formatText(responsibilities)}</p>
            </>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags && tags.map((tag, index) => (
          <span 
            key={index}
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-between items-center mt-4">
        {/* Toggle expand/collapse button */}
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
        
        <div className="flex space-x-2">
          {/* Show "Apply Now" button only if the user is NOT the author, NOT alumni AND job is active */}
          {!isAuthor && !isAlumni && status === 'active' && applicationUrl &&(
            
            <button 
              onClick={() => {
                window.open(applicationUrl, '_blank', 'noopener,noreferrer');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
               Apply Now
            </button>
          )}
          
          {/* Show "Mark as Filled" button only for the author if the job is active */}
          {isAuthor && status === 'active' && (
            <button 
              onClick={handleStatusChange}
              disabled={isUpdating}
              className={`bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition shadow-sm ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUpdating ? 'Updating...' : 'Mark as Filled'}
            </button>
          )}
        </div>
      </div>

      {/* Conditionally render ApplyForm if Apply Now is clicked */}
      {/* {showApplyForm && <ApplyForm jobId={id} jobTitle={title} />} */}
    </div>
  );
};

export default JobCard;
