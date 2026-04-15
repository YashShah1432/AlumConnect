import React, { useState, useEffect, useCallback } from "react";

const SearchBar = ({ onSearch, placeholder }) => {
  const [query, setQuery] = useState("");
  
  // Debounced search using useCallback to prevent unnecessary re-creation
  const debouncedSearch = useCallback(
    (() => {
      let timer;
      return (searchText) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          onSearch(searchText);
        }, 500);
      };
    })(),
    [onSearch]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear any pending debounce timers and search immediately
    debouncedSearch.cancel?.() || clearTimeout();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder || "Search..."}
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />
        <div className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            className="absolute right-12 top-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 top-3 text-blue-600 hover:text-blue-800"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;