import React from 'react';
import Navbar from '../../components/landing-page/Navbar';
import Footer from '../../components/landing-page/Footer';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

const LegalPageLayout = ({ title, subtitle, children }) => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.12 });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Decorative header */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-800 p-6 sm:p-8 shadow-sm dark:shadow-xl">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-400 to-indigo-300 animate-gradient" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-cyan-300 to-blue-300 animate-gradient" />

            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Content card with reveal */}
          <section
            ref={ref}
            className={`reveal ${revealed ? 'reveal-in' : ''} mt-8 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/90 p-6 sm:p-8 shadow-sm dark:shadow-xl backdrop-blur-sm`}
          >
            <div className="prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
              {children}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;
