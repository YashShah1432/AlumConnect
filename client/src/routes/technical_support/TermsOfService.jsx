import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const TermsOfService = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="By accessing or using AlumConnect, you agree to the following terms. These terms are designed to maintain a safe and productive environment for WIT Solapur alumni, students and staff."
    >
      <section className="space-y-6 text-sm sm:text-base leading-relaxed">
        {[
          {
            h: "1. Eligibility",
            p: "AlumConnect is intended for verified WIT Solapur alumni, students, faculty and authorized admins. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account."
          },
          {
            h: "2. Acceptable Use",
            p: "When using AlumConnect, you agree that you will not:"
          }
        ].map((s) => (
          <div key={s.h} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.h}</h2>
            <p>{s.p}</p>

            {s.h === "2. Acceptable Use" ? (
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Share false, misleading or inappropriate information.</li>
                <li>Harass, abuse or disrespect other users.</li>
                <li>Post unauthorized job opportunities, spam or promotional content unrelated to the alumni–student community.</li>
                <li>Misuse features like messaging, donations or discussions for illegal or harmful purposes.</li>
              </ul>
            ) : null}
          </div>
        ))}

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Content and Contributions</h2>
          <p>
            You are responsible for the content you share (announcements, posts, job listings, discussions,
            funding requests, etc.). Admins may review, edit or remove content that violates institute guidelines
            or these terms.
          </p>
          <p className="mt-2">
            By posting on AlumConnect, you grant the platform and WIT Solapur a non-exclusive right to display that
            content within the community for informational and engagement purposes.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Donations and Funding</h2>
          <p>
            Donation and funding features are provided to support students, projects and institutional initiatives.
            All financial processes are subject to the institute’s official policies and approvals.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Third-Party Links</h2>
          <p>
            Some content (such as external job links, social profiles or event pages) may lead to third-party websites.
            AlumConnect is not responsible for the content or policies of those sites.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Suspension or Termination</h2>
          <p>
            If you misuse the platform or violate these terms, your access may be restricted or suspended by the admins.
            Serious violations may also be reported to the institute authorities as per policy.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to These Terms</h2>
          <p>
            These Terms of Service may be updated as the platform evolves. Continued use of AlumConnect after changes means
            you accept the updated terms.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfService;