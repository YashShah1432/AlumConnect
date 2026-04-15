const SearchBar = ({ onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search announcements..."
      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
};

export default SearchBar;
