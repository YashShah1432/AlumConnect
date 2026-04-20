import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/landing-page/Navbar';
import Footer from '../components/landing-page/Footer';
import axiosInstance from '../utils/axiosConfig';

const branches = [
  { label: 'Computer Science & Engineering', code: 'CSE' },
  { label: 'Information Technology', code: 'IT' },
  { label: 'Electronics & Telecommunication Engineering', code: 'E&TC' },
  { label: 'Mechanical Engineering', code: 'MECH' },
  { label: 'Civil Engineering', code: 'CIVIL' },
  { label: 'Electronics and Computer Engineering', code: 'ECM' },
];

const initialFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'student',
  dob: '',
  branch: '',
  branchCode: '',
  batch: '',
  homeTown: '',
  PRN: '',
  currentCompany: '',
  currentCompanyRole: '',
  location: '',
  linkedIn: '',
  instagram: '',
  github: '',
  twitter: '',
};

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // Timer effect for OTP resend cooldown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const selectedBranchCode = useMemo(() => {
    const found = branches.find(b => b.label === formData.branch);
    return found ? found.code : '';
  }, [formData.branch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      let updated = { ...prev, [name]: value };

      if (name === 'branch') {
        const found = branches.find(b => b.label === value);
        updated.branchCode = found ? found.code : '';
      }

      if (name === 'phone') {
        updated.phone = value.replace(/\D/g, '').slice(0, 12);
      }

      if (name === 'PRN') {
        updated.PRN = value.replace(/\D/g, '').slice(0, 10);
      }

      return updated;
    });

    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
    setApiSuccess('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@]+@gmail\.com$/i.test(formData.email.trim())) {
      newErrors.email = 'Only @gmail.com addresses are allowed';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,12}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10–12 digits';
    }

    if (!formData.role) newErrors.role = 'Role is required';

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Check if DOB is at least 18 years ago
      const dobDate = new Date(formData.dob);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 18);
      if (dobDate > minDate) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    if (!formData.branch) newErrors.branch = 'Branch is required';

    if (!formData.batch.trim()) newErrors.batch = 'Batch is required';

    if (!formData.homeTown.trim()) newErrors.homeTown = 'Home town is required';

    if (formData.role === 'student') {
      if (!formData.PRN) {
        newErrors.PRN = 'PRN is required for students';
      } else if (!/^\d{10}$/.test(formData.PRN)) {
        newErrors.PRN = 'PRN must be exactly 10 digits';
      }
    } else if (formData.PRN && !/^\d{10}$/.test(formData.PRN)) {
      newErrors.PRN = 'PRN must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const socialLinks = {
      linkedin: formData.linkedIn || undefined,
      instagram: formData.instagram || undefined,
      github: formData.github || undefined,
      x: formData.twitter || undefined,
    };

    Object.keys(socialLinks).forEach(key => {
      if (!socialLinks[key]) delete socialLinks[key];
    });

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      dob: formData.dob,
      branch: formData.branch,
      branchCode: formData.branchCode || selectedBranchCode,
      batch: formData.batch.trim(),
      homeTown: formData.homeTown.trim(),
      PRN: formData.PRN || undefined,
      currentCompany: formData.currentCompany || undefined,
      currentCompanyRole: formData.currentCompanyRole || undefined,
      location: formData.location || undefined,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
      otp
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!formData.email || errors.email) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid Gmail address' }));
      return;
    }
    setOtpLoading(true);
    try {
      await axiosInstance.post('/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      setOtpTimer(60);
      setApiSuccess('OTP sent to your email.');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!otp || otp.length !== 6) {
      setApiError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setOtpLoading(true);
    try {
      await axiosInstance.post('/auth/verify-otp', { email: formData.email, otp });
      setOtpVerified(true);
      setApiSuccess('OTP verified! You can now register.');
    } catch (err) {
      setApiError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validate()) return;
    if (!otpVerified) {
      setApiError('Please verify your OTP before registering.');
      return;
    }
    const payload = buildPayload();
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/auth/register', payload);
      if (res.data && res.data.success === false) {
        throw new Error(res.data.message || 'Registration failed');
      }
      setApiSuccess('Registration successful! Await admin approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Something went wrong';
      setApiError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 pt-25">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-xl rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create your Alum-Connect account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Join the network as a student or alumni. Use your Gmail account to register.
              </p>
            </div>



            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="you@gmail.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      minLength={8}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="At least 8 characters, upper, lower, digit, special"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={12}
                    minLength={10}
                    value={formData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData({ ...formData, phone: val });
                    }}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="10–12 digits"
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    required
                  />
                  {errors.dob && (
                    <p className="mt-1 text-xs text-red-600">{errors.dob}</p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                  >
                    <option value="">Select branch</option>
                    {branches.map(b => (
                      <option key={b.code} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <p className="mt-1 text-xs text-red-600">{errors.branch}</p>
                  )}
                </div>

                {/* Branch Code (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    name="branchCode"
                    value={formData.branchCode || selectedBranchCode}
                    readOnly
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner text-slate-600"
                    placeholder="Auto-selected"
                  />
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Batch
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="e.g., 2020–2024"
                  />
                  {errors.batch && (
                    <p className="mt-1 text-xs text-red-600">{errors.batch}</p>
                  )}
                </div>

                {/* Home Town */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Home Town
                  </label>
                  <input
                    type="text"
                    name="homeTown"
                    value={formData.homeTown}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="Your home town"
                  />
                  {errors.homeTown && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.homeTown}
                    </p>
                  )}
                </div>

                {/* PRN */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    PRN {formData.role === 'student' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="PRN"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={10}
                    minLength={10}
                    value={formData.PRN}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, PRN: val });
                    }}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                    placeholder="10 digit PRN"
                    required={formData.role === 'student'}
                  />
                  {errors.PRN && (
                    <p className="mt-1 text-xs text-red-600">{errors.PRN}</p>
                  )}
                  {formData.role === 'alumni' && !errors.PRN && (
                    <p className="mt-1 text-xs text-slate-400">
                      Optional for alumni; required for students.
                    </p>
                  )}
                </div>
              </div>

              {/* Optional / collapsible section */}
              <div className="pt-2 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOptional(prev => !prev)}
                  className="flex items-center text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  <span className="mr-1">
                    {showOptional ? 'Hide optional details' : 'Add optional details'}
                  </span>
                  <span className="text-xs">
                    {showOptional ? '▲' : '▼'}
                  </span>
                </button>

                {showOptional && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Company */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Current Company
                      </label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="Company name"
                      />
                    </div>

                    {/* Current Company Role */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Current Role / Position
                      </label>
                      <input
                        type="text"
                        name="currentCompanyRole"
                        value={formData.currentCompanyRole}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Current Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="City, Country"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Instagram
                      </label>
                      <input
                        type="url"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    {/* Twitter / X */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        X (Twitter)
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="https://x.com/username"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* OTP Section */}
              <div className="mt-4 flex flex-col gap-2">
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !formData.email || !!errors.email}
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                )}

                {otpSent && !otpVerified && (
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none w-full sm:w-48"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length !== 6}
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0}
                      className="inline-flex items-center justify-center rounded-lg bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Resend OTP {otpTimer > 0 && `(${otpTimer}s)`}
                    </button>
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle2 className="h-4 w-4" /> OTP verified!
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !otpVerified}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Creating account...' : 'Sign up'}
                </button>

                <p className="text-xs text-slate-500 text-center sm:text-right">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-sky-700 hover:text-sky-800"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
            {(apiError || apiSuccess) && (
              <div
                className={`mx-auto mb-0 mb-6 w-full max-w-md rounded-lg border px-5 py-3 text-sm flex items-center gap-3 shadow-sm ${apiError
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-green-200 bg-green-50 text-green-700'
                  }`}
              >
                {apiError ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{apiError || apiSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;