import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";
import { FaBullhorn, FaBriefcase, FaDonate, FaUserGraduate, FaUsers, FaComments, FaChartLine } from "react-icons/fa";
// import axios from "axios";
import { useUser } from "../context/UserContext";
import axios from "../utils/axiosConfig";
import Layout from '../components/common/Layout';

const COLORS = ["#6366f1", "#34d399", "#f59e42", "#f43f5e", "#3b82f6", "#a78bfa"];

const AnimatedCard = ({ title, value, icon, color }) => (
  <div
    className="flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-2xl shadow-xl p-6 m-2 w-full transform transition-transform hover:scale-105 hover:shadow-2xl animate-float"
    style={{ borderBottom: `4px solid ${color}` }}
  >
    <div className="text-4xl mb-2" style={{ color }}>{icon}</div>
    <div className="text-3xl font-extrabold text-gray-800 animate-pulse">{value}</div>
    <div className="text-gray-500 mt-1 font-semibold">{title}</div>
  </div>
);

const DashboardSection = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in mb-8">
    <h2 className="text-xl font-bold mb-4 text-indigo-700">{title}</h2>
    {children}
  </div>
);

const chartContainer = "w-full h-72 flex items-center justify-center animate-fade-in";

const API = {
  announcements: "/api/admin/announcements/all",
  jobs: "/api/jobs/admin",
  donations: "/api/donations/admin",
  opportunities: "/api/opportunities/admin",
  users: "/api/users",
  forum: "/api/forum/posts",
};

function getMonthlyTrends(items, dateField = "createdAt", months = 6) {
  // Returns array: [{month: '2026-01', count: 5}, ...]
  const now = new Date();
  const trends = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    trends.push({ month: monthStr, count: 0 });
  }
  items.forEach(item => {
    const d = new Date(item[dateField]);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = trends.find(t => t.month === monthStr);
    if (found) found.count += 1;
  });
  return trends;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    announcements: 0,
    jobs: 0,
    donations: 0,
    opportunities: 0,
    users: 0,
    alumni: 0,
    students: 0,
    forumPosts: 0,
    announcementTrends: [],
    jobTrends: [],
    donationTrends: [],
    forumTrends: [],
    opportunityTrends: [],
    alumniVsStudent: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      axios.get(API.announcements),
      axios.get(API.jobs),
      axios.get(API.donations),
      axios.get(API.opportunities),
      axios.get(API.users),
      axios.get(API.forum),
    ])
      .then(([ann, jobs, dons, opps, users, forum]) => {
        // Users: count alumni/students
        const alumni = users.data.filter(u => u.role === "alumni").length;
        const students = users.data.filter(u => u.role === "student").length;
        setStats({
          announcements: ann.data.length,
          jobs: jobs.data.length,
          donations: dons.data.length,
          opportunities: opps.data.length,
          users: users.data.length,
          alumni,
          students,
          forumPosts: forum.data.length,
          announcementTrends: getMonthlyTrends(ann.data),
          jobTrends: getMonthlyTrends(jobs.data),
          donationTrends: getMonthlyTrends(dons.data),
          forumTrends: getMonthlyTrends(forum.data),
          opportunityTrends: getMonthlyTrends(opps.data),
          alumniVsStudent: [
            { name: "Alumni", value: alumni },
            { name: "Students", value: students },
          ],
        });
      })
      .catch(e => {
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <FaChartLine className="animate-spin text-5xl text-indigo-500 mb-4" />
      <div className="text-lg text-gray-500">Loading dashboard...</div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <FaChartLine className="text-5xl text-red-500 mb-4" />
      <div className="text-lg text-red-500">{error}</div>
    </div>
  );

  return (
    <Layout>
    <div className="max-w-7xl mx-auto px-2 py-6 animate-fade-in">
      {/* Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 pr-4">
        <AnimatedCard title="Announcements" value={stats.announcements} icon={<FaBullhorn />} color={COLORS[0]} />
        <AnimatedCard title="Jobs" value={stats.jobs} icon={<FaBriefcase />} color={COLORS[1]} />
        <AnimatedCard title="Donations" value={stats.donations} icon={<FaDonate />} color={COLORS[2]} />
        <AnimatedCard title="Opportunities" value={stats.opportunities} icon={<FaUserGraduate />} color={COLORS[3]} />
        <AnimatedCard title="Users" value={stats.users} icon={<FaUsers />} color={COLORS[4]} />
        {/* <AnimatedCard title="Alumni" value={stats.alumni} icon={<FaUserGraduate />} color={COLORS[5]} /> */}
        {/* <AnimatedCard title="Students" value={stats.students} icon={<FaUserGraduate />} color={COLORS[0]} /> */}
        <AnimatedCard title="Forum Posts" value={stats.forumPosts} icon={<FaComments />} color={COLORS[1]} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Announcements Trend */}
        <DashboardSection title="Announcements">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.announcementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={COLORS[0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        {/* Jobs Trend */}
        <DashboardSection title="Jobs">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.jobTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS[1]}
                  strokeWidth={3}
                  dot={{ r: 6, fill: COLORS[1] }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        {/* Donations Trend */}
        <DashboardSection title="Donations">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.donationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={COLORS[2]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        {/* Forum Posts Trend */}
        <DashboardSection title="Forum Posts">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.forumTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS[3]}
                  strokeWidth={3}
                  dot={{ r: 6, fill: COLORS[3] }}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        {/* Opportunities Trend */}
        <DashboardSection title="Opportunities">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.opportunityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={COLORS[4]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        {/* Alumni vs Students Pie */}
        <DashboardSection title="Alumni vs Students">
          <div className={chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.alumniVsStudent}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={COLORS[5]}
                  label
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-in"
                >
                  {stats.alumniVsStudent.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
      </div>
    </div>
    </Layout>
  );
};

export default AdminDashboard;