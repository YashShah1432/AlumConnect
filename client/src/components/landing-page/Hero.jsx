import React, { useState, useEffect } from "react";
import connectLogo from "../../../assets/connect_logo_black.svg";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const Hero = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.2 });

  useEffect(() => {
    const img = new Image();
    img.src = connectLogo;
    img.onload = () => setImagesLoaded(true);
    img.onerror = () => setImagesLoaded(true);
  }, []);

  return (
    <div id="top" className="relative bg-white pt-16 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-400 to-cyan-300 animate-gradient" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-400 to-blue-300 animate-gradient" />
      </div>

      <main className="relative w-full px-4 sm:px-6 lg:px-8">
        <section
          ref={ref}
          className={`reveal ${revealed ? "reveal-in" : ""} max-w-5xl mx-auto flex flex-col items-center text-center py-16 sm:py-20`}
        >
          {!imagesLoaded ? (
            <div className="w-40 h-24 mb-8 bg-gray-200 animate-pulse rounded-xl" />
          ) : (
            <div className="animate-float">
              <img
                src={connectLogo}
                alt="Alum Connect Logo"
                className="w-36 sm:w-44 mb-8 drop-shadow-sm"
              />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Welcome to <span className="text-blue-600 block mt-2">AlumConnect</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Connect with your alma mater, build lasting relationships, and contribute to the future of
            education through mentorship, opportunities, and community support.
          </p>

          {/* ✅ Buttons removed as requested */}

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            {[
              { label: "Mentorship", value: "1:1 Guidance" },
              { label: "Networking", value: "Alumni + Students" },
              { label: "Support", value: "Verified Donations" }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Hero;