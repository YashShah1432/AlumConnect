import React from 'react';
import { Bell, Users, MessageCircle, Search, Gift } from 'lucide-react';
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const Services = () => {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.15 });

  const services = [
    {
      title: "Announcements",
      description:
        "Stay updated with live announcements on reunions, alumni success stories, upcoming workshops, guest lectures, and college events.",
      icon: <Bell className="w-6 h-6" />,
    },
    {
      title: "Networking Hub",
      description:
        "Connect with fellow graduates, share wins, discover referrals, and collaborate on ideas.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Guidance and Mentorship",
      description:
        "Students can access personalized guidance from alumni through secure messaging.",
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      title: "Smart Searches",
      description:
        "Find alumni by company, role, fields and location with smart filters and profile details.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      title: "Community Building",
      description:
        "Join or create communities based on fields, interests, companies, and discussions.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Donations",
      description:
        "Verified donation portal for supporting innovation and enabling government-backed tax exemption certificates.",
      icon: <Gift className="w-6 h-6" />,
    },
  ];

  return (
    <section
      ref={ref}
      className={`reveal ${revealed ? "reveal-in" : ""} py-14 sm:py-16 bg-white dark:bg-gray-950`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Our Services</h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg max-w-2xl mx-auto">
            Everything needed to keep alumni and students connected—securely and meaningfully.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 p-6 shadow-sm dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/50" />

              <div className="relative flex items-center gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.title}</h3>
              </div>

              <p className="relative mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {service.description}
              </p>

              <div className="relative mt-5 h-1 w-10 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
