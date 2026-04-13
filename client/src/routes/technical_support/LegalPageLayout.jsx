import React from 'react';
import Navbar from '../../components/landing-page/Navbar';
import Footer from '../../components/landing-page/Footer';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

const LegalPageLayout = ({ title, subtitle, children }) => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.12 });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Decorative header */}
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8 shadow-sm">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-400 to-indigo-300 animate-gradient" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-cyan-300 to-blue-300 animate-gradient" />

            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 text-gray-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Content card with reveal */}
          <section
            ref={ref}
            className={`reveal ${revealed ? 'reveal-in' : ''} mt-8 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm`}
          >
            <div className="prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
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