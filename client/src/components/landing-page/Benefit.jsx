import React from "react";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const Benefit = () => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.15 });

  return (
    <section id="benefit" className="py-16 bg-white dark:bg-gray-950 scroll-mt-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[-80px] h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-300 to-indigo-300 animate-gradient" />
        <div className="absolute -bottom-24 left-[-80px] h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-15 bg-gradient-to-br from-cyan-200 to-blue-300 animate-gradient" />
      </div>

      <div
        ref={ref}
        className={`reveal ${revealed ? "reveal-in" : ""} relative w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto`}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Benefits of AlumConnect
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg max-w-2xl mx-auto">
            AlumConnect bridges alumni and students, turning your college community into a powerful network for mentorship,
            opportunities, and growth.
          </p>
          <div className="w-14 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Students card */}
          <div className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 sm:p-8 shadow-sm dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">For Students</h3>
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 group-hover:bg-blue-600 transition-colors" />
            </div>

            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Students get real-world guidance, industry exposure, and direct access to alumni who walked the same path.
            </p>

            <ul className="mt-5 space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              {[
                ["Career & higher studies guidance", "Advice on internships, placements, and admissions."],
                ["Mentorship & 1:1 support", "Doubts about skills, projects, interview prep, and career choices."],
                ["Networking opportunities", "Build an early professional network across domains and locations."],
                ["Discover events & opportunities", "Stay updated on workshops, talks, hackathons and referrals."]
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-white">{title}:</span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 h-1 w-12 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors" />
          </div>

          {/* Alumni card */}
          <div className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 sm:p-8 shadow-sm dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">For Alumni</h3>
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 group-hover:bg-emerald-600 transition-colors" />
            </div>

            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Alumni get a structured way to stay connected, give back, and grow their professional circle.
            </p>

            <ul className="mt-5 space-y-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              {[
                ["Give back through mentorship", "Guide students and share experiences."],
                ["Find talent & hire juniors", "Discover skilled students for internships and roles."],
                ["Stay connected with your batch", "Updates on reunions, stories and college achievements."],
                ["Support through donations & initiatives", "Contribute to student projects and growth."]
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-white">{title}:</span>{" "}
                    <span className="text-gray-700 dark:text-gray-300">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 h-1 w-12 rounded-full bg-emerald-600/20 group-hover:bg-emerald-600 transition-colors" />
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
            Whether you are a student looking for guidance or an alumnus wanting to give back, AlumConnect brings everyone together.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm sm:text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Get Started with AlumConnect
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Benefit;
