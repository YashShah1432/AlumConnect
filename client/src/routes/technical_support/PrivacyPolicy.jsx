import React from 'react';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="This Privacy Policy explains how AlumConnect (the alumni–student engagement platform for WIT Solapur) collects, uses and protects your information when you use our website."
    >
      <section className="space-y-6 text-sm sm:text-base leading-relaxed">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>
            When you sign up on AlumConnect as a student or alumnus, we may collect:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Name, email address and password.</li>
            <li>Profile details such as branch, batch, current company and role.</li>
            <li>Contact information like phone number and social profile links.</li>
            <li>Activity data related to job posts, applications, discussions, donations and messages within the platform.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Create and manage your AlumConnect account.</li>
            <li>Help students and alumni discover each other through networking, smart search and communities.</li>
            <li>Show relevant announcements, events, jobs, funding opportunities and donations.</li>
            <li>Improve the platform’s features and maintain security of user accounts.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data Sharing and Visibility</h2>
          <p>
            Your basic profile information (such as name, branch, batch and professional details) is visible to
            other verified users on the platform to support networking and mentorship. We do not sell your data
            to third parties.
          </p>
          <p className="mt-2">
            Certain data (like applications, donations or posts) may be visible to admins for moderation and
            verification as part of college processes.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Security</h2>
          <p>
            We use secure connections and authentication to protect access to your account. However, no system is 100% secure,
            so we encourage you to use a strong password and not share your login details with others.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Your Choices</h2>
          <p>You can:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Update your profile information at any time.</li>
            <li>Request correction of inaccurate data via the alumni cell / admin.</li>
            <li>Reach out to the institute if you wish to deactivate your account or remove certain information, subject to college policies.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Contact</h2>
          <p>
            For questions about this Privacy Policy, you can reach the institute at{' '}
            <span className="font-semibold">principal@witsolapur.org</span> or contact the AlumConnect core team using
            the details on the Contact page.
          </p>
        </div>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;