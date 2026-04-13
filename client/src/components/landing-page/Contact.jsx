import React from "react";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const Contact = () => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.15 });

  return (
    <section id="contact" className="py-16 bg-white scroll-mt-24 relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-15 bg-gradient-to-br from-blue-300 to-indigo-300 animate-gradient" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-10 bg-gradient-to-br from-cyan-200 to-blue-300 animate-gradient" />
      </div>

      <div
        ref={ref}
        className={`reveal ${revealed ? "reveal-in" : ""} relative w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto`}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Contact Us</h2>
          <p className="mt-3 text-base text-gray-600 sm:text-lg max-w-2xl mx-auto">
            Get in touch for guidance, collaboration, or general inquiries.
          </p>
          <div className="w-14 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[2fr,3fr] items-start">
          {/* Left */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Core Team</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                We are committed to building a strong community connecting alumni and students.
              </p>

              {/* ✅ 4 cards -> 2 columns (sm+) => 2 rows */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "Yash Shah",
                    linkedin: "https://www.linkedin.com/in/yashshah1432",
                    instagram: "https://www.instagram.com/yashshah1432"
                  },
                  {
                    name: "Viraj Waykos",
                    linkedin: "https://www.linkedin.com/in/viraj-waykos-984494259",
                    instagram: "https://www.instagram.com/virraj_04"
                  },
                  {
                    name: "Aditya Patil",
                    linkedin: "https://www.linkedin.com/in/patil-aditya-916672259",
                    instagram: "https://www.instagram.com/patiladityya"
                  },
                  {
                    name: "Anant Patil",
                    linkedin: "https://www.linkedin.com/in/patilanant7",
                    instagram: "https://www.instagram.com/anantpatil.9"
                  }
                ].map((p) => (
                  <div
                    key={p.name}
                    className="group rounded-2xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5 hover:bg-white hover:shadow-md transition-all"
                  >
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">
                      {p.name}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      <a
                        href={p.linkedin}
                        className="relative inline-flex text-blue-600 transition-colors hover:text-blue-700
                               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all
                               hover:after:w-full"
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn
                      </a>
                      {" · "}
                      <a
                        href={p.instagram}
                        className="relative inline-flex text-pink-600 transition-colors hover:text-pink-700
                               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-pink-600 after:transition-all
                               hover:after:w-full"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Instagram
                      </a>
                    </p>

                    <div className="mt-3 h-1 w-10 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">General Inquiries</h3>
              <p className="mt-3 text-sm sm:text-base text-gray-600">
                For general inquiries or to learn more about contributing to the alumni community, reach out:
              </p>

              <div className="mt-4 text-sm sm:text-base text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:principal@witsolapur.org" className="text-blue-600 hover:underline">
                    principal@witsolapur.org
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> (0217)2652700, 2653040
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm sm:text-base text-gray-600">Stay updated:</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a
                    href="https://www.linkedin.com/school/walchand-institute-of-technology-solapur"
                    className="inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/wit_solapur_official"
                    className="inline-flex items-center rounded-full border border-pink-500 px-4 py-2 text-sm text-pink-600 hover:bg-pink-600 hover:text-white transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-600">
              We believe in the power of community and look forward to connecting with you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;