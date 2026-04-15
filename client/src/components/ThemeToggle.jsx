import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:shadow-lg"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={18} className="transition-transform duration-300 rotate-0 text-amber-300" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 rotate-0 text-slate-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
