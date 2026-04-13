import React from 'react';
import { Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import LegalPageLayout from './LegalPageLayout';

const Support = () => {
  return (
    <LegalPageLayout
      title="Support & Help"
      subtitle="Need help with AlumConnect? Whether you’re a student, alumnus or admin, we’re here to support you in using the platform effectively."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <section className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">General Platform Support</h2>
          </div>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            For issues related to logging in, updating your profile, networking, job applications or donations,
            you can contact the AlumConnect coordination team.
          </p>

          <ul className="space-y-2 text-sm sm:text-base text-gray-700">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span><span className="font-semibold">Email:</span> principal@witsolapur.org</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span><span className="font-semibold">Phone:</span> (0217) 2652700, 2653040</span>
            </li>
          </ul>
        </section>

        <section className="group rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connect with Core Team</h2>
          </div>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Reach out to the AlumConnect core team members for feedback, suggestions or technical issues related to the platform.
          </p>

          {/* ✅ Responsive grid: 1 col (mobile) → 2 cols (sm+) so 4 cards fit in 2 rows */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
            {[
              { name: "Yash Shah", li: "https://www.linkedin.com/in/yashshah1432", ig: "https://www.instagram.com/yashshah1432" },
              { name: "Viraj Waykos", li: "https://www.linkedin.com/in/viraj-waykos-984494259", ig: "https://www.instagram.com/virraj_04" },
              { name: "Aditya Patil", li: "https://www.linkedin.com/in/patil-aditya-916672259", ig: "https://www.instagram.com/patiladityya" },
              { name: "Anant Patil", li: "https://www.linkedin.com/in/patilanant7", ig: "https://www.instagram.com/anantpatil.9" }
            ].map((p) => (
              <li
                key={p.name}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="mt-1">
                  <a
                    className="relative inline-flex text-blue-600 transition-colors hover:text-blue-700
                               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all
                               hover:after:w-full"
                    href={p.li}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                  {' · '}
                  <a
                    className="relative inline-flex text-pink-600 transition-colors hover:text-pink-700
                               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-pink-600 after:transition-all
                               hover:after:w-full"
                    href={p.ig}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 hover:shadow-sm transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Common Topics We Help With</h2>
        <ul className="grid gap-3 text-sm sm:text-base text-gray-700 md:grid-cols-2">
          <li>Issues with login or signup for students and alumni.</li>
          <li>Updating profile details and social links.</li>
          <li>Posting or editing job opportunities and announcements.</li>
          <li>Doubts regarding donations and funding requests.</li>
          <li>Using discussion boards and networking features.</li>
          <li>Reporting inappropriate content or misuse.</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
};

export default Support;