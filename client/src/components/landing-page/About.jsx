import React from "react";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const About = () => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.15 });

  const highlights = [
    {
      title: "Mission",
      text:
        "Our mission is to empower alumni to stay connected with their college and juniors, fostering a collaborative network where knowledge, experiences, and opportunities can be shared freely."
    },
    {
      title: "Vision",
      text:
        "We envision a thriving alumni network where every alumnus plays a vital role in the growth and development of the college community through seamless communication and interaction."
    },
    {
      title: "Goal",
      text:
        "Provide a platform where alumni can actively contribute via mentoring, donations, and networking—shaping the future of the college and supporting students."
    }
  ];

  return (
    <section id="about" className="py-16 bg-gray-50 dark:bg-gray-900 scroll-mt-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 right-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-400 to-indigo-300" />
      </div>

      <div
        ref={ref}
        className={`reveal ${revealed ? "reveal-in" : ""} w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto`}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">About Us</h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg max-w-2xl mx-auto">
            We are DevNexus, a passionate team of developers focused on bridging the gap between alumni and their alma mater.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          {/* Left card */}
          <div className="h-full flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 p-6 sm:p-8 shadow-sm dark:shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Building stronger alumni connections
            </h3>

            <div className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                As a dynamic and innovative startup, we aim to create meaningful connections that strengthen
                the bond between alumni, current students, and the institution. Our platform enables seamless
                engagement, collaboration, and support across generations.
              </p>
              <p>
                Our team brings together diverse skills in web development, machine learning, app development,
                and design to ensure the platform is robust, scalable, and user-friendly.
              </p>

              {/* ✅ Added content so the card doesn’t feel empty */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">What you can do on AlumConnect</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {[
                    "Find alumni and students by batch, branch, skills and location.",
                    "Post and discover opportunities (jobs, internships, events).",
                    "Join communities and discussions for shared interests.",
                    "Support innovation via verified donations and initiatives."
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">Focus</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">Community & Growth</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm dark:hover:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">Built for</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">Students & Alumni</p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="h-full flex flex-col">
            <div className="grid gap-4 sm:gap-5 h-full">
              {highlights.map((h) => (
                <div
                  key={h.title}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 p-6 shadow-sm dark:shadow-xl hover:shadow-md dark:hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{h.title}</h3>
                    <div className="h-9 w-9 rounded-xl bg-blue-600/10 group-hover:bg-blue-600 transition-colors" />
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    {h.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
