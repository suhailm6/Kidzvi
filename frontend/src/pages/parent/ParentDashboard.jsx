import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboard } from "../../api/parentApi";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const QUICK_LINKS = [
  {
    label: "Add Child",
    icon: "👦",
    path: "/parent/children",
    color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
  },
  {
    label: "Assign Activity",
    icon: "📌",
    path: "/parent/assign-activities",
    color: "bg-purple-50 hover:bg-purple-100 text-purple-700",
  },
  {
    label: "Review Approvals",
    icon: "✅",
    path: "/parent/approvals",
    color: "bg-green-50 hover:bg-green-100 text-green-700",
  },
  {
    label: "Manage Rewards",
    icon: "🎁",
    path: "/parent/rewards",
    color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
  },
];

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data || res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-4xl mb-4">⚠️</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      icon: "👦",
      label: "Total Children",
      value: data?.totalChildren ?? 0,
      color: "indigo",
      delay: 0,
    },
    {
      icon: "🎯",
      label: "Activities This Week",
      value: data?.activitiesThisWeek ?? 0,
      color: "green",
      delay: 0.1,
    },
    {
      icon: "⏳",
      label: "Pending Approvals",
      value: data?.pendingApprovals ?? 0,
      color: "yellow",
      delay: 0.2,
    },
    {
      icon: "🏆",
      label: "Reward Requests",
      value: data?.pendingRewardClaims ?? 0,
      color: "purple",
      delay: 0.3,
    },
  ];

  const weeklyData = data?.weeklyActivity || [
    { day: "Mon", completed: 2 },
    { day: "Tue", completed: 4 },
    { day: "Wed", completed: 1 },
    { day: "Thu", completed: 5 },
    { day: "Fri", completed: 3 },
    { day: "Sat", completed: 2 },
    { day: "Sun", completed: 0 },
  ];

  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDate(new Date())} — Here's what's happening with your family
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${link.color} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors text-center`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <Card
          title="Weekly Activity"
          subtitle="Activities completed per day"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="completed"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Children Overview */}
        <Card title="Children Overview">
          {data?.children && data.children.length > 0 ? (
            <div className="space-y-3">
              {data.children.map((child) => (
                <Link
                  key={child._id || child.id}
                  to={`/parent/children/${child._id || child.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                    {child.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                      {child.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {child.points || 0} pts · Age {child.age}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">👦</p>
              <p className="text-gray-500 text-sm">No children yet.</p>
              <Link
                to="/parent/children"
                className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline"
              >
                Add your first child →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Latest completions and requests">
        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.slice(0, 8).map((item, i) => (
              <motion.div
                key={item._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === "COMPLETED"
                      ? "bg-green-400"
                      : item.status === "PENDING_APPROVAL"
                        ? "bg-yellow-400"
                        : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {item.childName} — {item.activityTitle}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(item.date)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : item.status === "PENDING_APPROVAL"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status?.replace(/_/g, " ")}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-400 text-sm">No recent activity yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ParentDashboard;
