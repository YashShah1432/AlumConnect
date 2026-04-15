// Enhanced CreatePostForm with Success Confirmation
import React, { useState, useEffect } from "react";
import axios from "axios";

const CreatePostForm = ({ user, setPosts }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear success message after 5 seconds
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleCreatePost = async () => {
    // Reset previous messages
    setError("");
    setSuccessMessage("");

    // Validate inputs
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }
    
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }

    if (!content.trim()) {
      setError("Post content cannot be empty.");
      return;
    }

    if (title.length > 100) {
      setError("Title must be 100 characters or less.");
      return;
    }

    if (content.length > 1000) {
      setError("Post content must be 1000 characters or less.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_backend_URL}/api/forum/posts`,
        { 
          title, 
          content, 
          authorId: user.id 
        },
        { withCredentials: true }
      );

      // Prepend the new post to the list
      setPosts((prev) => [response.data, ...prev]);
      
      // Show success message
      setSuccessMessage("Post created successfully!");
      
      // Clear form
      setTitle("");
      setContent("");
      setError("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
      setError(error.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Create a New Post</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Start a new thread, ask for help, or share something useful with the community.</p>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-md mb-4 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-md mb-4 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent" 
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/100 characters</p>
        </div>
        
        <div>
          <textarea 
            placeholder="Write your post..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 w-full rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          ></textarea>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{content.length}/1000 characters</p>
        </div>
        
        <div>
          <button 
            onClick={handleCreatePost} 
            disabled={isSubmitting}
            className={`px-5 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm ${
              isSubmitting 
                ? "bg-blue-400 text-white cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {isSubmitting ? "Posting..." : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
