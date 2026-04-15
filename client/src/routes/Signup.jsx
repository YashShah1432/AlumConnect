// ...existing code...
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

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

      if (name === 'role' && value === 'alumni') {
        // keep PRN but relax validation (handled in validate)
      }

      if (name === 'phone') {
        updated.phone = value.replace(/\D/g, '');
      }

      if (name === 'PRN') {
        updated.PRN = value.replace(/\D/g, '');
      }

      return updated;
    });

    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^@]+@gmail\.com$/i.test(formData.email.trim())) {
      newErrors.email = 'Only @gmail.com addresses are allowed';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10–15 digits';
    }

    if (!formData.role) newErrors.role = 'Role is required';

    if (!formData.dob) newErrors.dob = 'Date of birth is required';

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
      linkedIn: formData.linkedIn || undefined,
      instagram: formData.instagram || undefined,
      github: formData.github || undefined,
      twitter: formData.twitter || undefined,
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
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    const payload = buildPayload();

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/auth/register', payload);
      if (res.data && res.data.success === false) {
        throw new Error(res.data.message || 'Registration failed');
      }
      navigate('/login');
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 pt-25">
        <div className="w-full max-w-3xl">
          <div className="bg-gray-50 dark:bg-gray-900 shadow-xl dark:shadow-2xl rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Create your Alum-Connect account
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Join the network as a student or alumni. Use your Gmail account to register.
              </p>
            </div>

            {apiError && (
              <div className="mx-6 mt-4 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="you@gmail.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 pr-10 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 pr-10 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="10–15 digits"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.role}</p>
                  )}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none"
                  />
                  {errors.dob && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.dob}</p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none"
                  >
                    <option value="">Select branch</option>
                    {branches.map(b => (
                      <option key={b.code} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  {errors.branch && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.branch}</p>
                  )}
                </div>

                {/* Branch Code (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    name="branchCode"
                    value={formData.branchCode || selectedBranchCode}
                    readOnly
                    className="mt-1 block w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 px-3 py-2 text-sm shadow-inner text-gray-600"
                    placeholder="Auto-selected"
                  />
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Batch
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., 2020–2024"
                  />
                  {errors.batch && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.batch}</p>
                  )}
                </div>

                {/* Home Town */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    Home Town
                  </label>
                  <input
                    type="text"
                    name="homeTown"
                    value={formData.homeTown}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Your home town"
                  />
                  {errors.homeTown && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                      {errors.homeTown}
                    </p>
                  )}
                </div>

                {/* PRN */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                    PRN {formData.role === 'student' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="PRN"
                    value={formData.PRN}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="10 digit PRN"
                  />
                  {errors.PRN && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errors.PRN}</p>
                  )}
                  {formData.role === 'alumni' && !errors.PRN && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Optional for alumni; required for students.
                    </p>
                  )}
                </div>
              </div>

              {/* Optional / collapsible section */}
              <div className="pt-2 border-t-2 border-gray-200 dark:border-gray-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOptional(prev => !prev)}
                  className="flex items-center text-sm font-medium text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
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
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Current Company
                      </label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={formData.currentCompany}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Company name"
                      />
                    </div>

                    {/* Current Company Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Current Role / Position
                      </label>
                      <input
                        type="text"
                        name="currentCompanyRole"
                        value={formData.currentCompanyRole}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="City, Country"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Instagram
                      </label>
                      <input
                        type="url"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    {/* Twitter / X */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        X (Twitter)
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-400 outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://x.com/username"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-sky-600 dark:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 dark:hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:ring-offset-1 dark:focus:ring-offset-gray-950 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? 'Creating account...' : 'Sign up'}
                </button>

                <p className="text-xs text-gray-600 dark:text-gray-400 text-center sm:text-right">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
);
};

export default Signup;
// ...existing code...