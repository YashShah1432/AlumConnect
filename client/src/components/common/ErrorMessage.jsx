import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 mb-4 rounded-xl shadow-sm">
      <p className="text-red-700 dark:text-red-400">{message}</p>
    </div>
  );
};

export default ErrorMessage;
