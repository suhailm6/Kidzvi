import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then((r) => setStats(r.data.data || r.data)).catch(() => {}),
      api.get("/admin/users?limit=5&sort=-createdAt").then((r) => {
        const data = r.data.data || r.data.users || r.data || [];
        setRecentUsers(Array.isArray(data) ? data : []);
      }).catch(() => {}),
      api.get("/activities?limit=5&sort=-createdAt").then((r) => {
        const data = r.data.data || r.data.activities || r.data || [];
        setRecentActivities(Array.isArray(data) ? data : []);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: "👥", label: "Total Users", value: stats?.totalUsers ?? 0, color: "indigo" },
    { icon: "👦", label: "Total Children", value: stats?.totalChildren ?? 0, color: "purple" },
    { icon: "📋", label: "Total Activities", value: stats?.totalActivities ?? 0, color: "blue" },
    { icon: "✅", label: "Total Completions", value: stats?.totalCompletions ?? 0, color: "green" },
  ];

  if (loading) return <LoadingSpinner text="Loading admin stats..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card
          title="Recent Users"
          headerAction={
            <Link to="/admin/users" className="text-indigo-600 text-xs hover:underline font-medium">
              View all
            </Link>
          }
        >
          {recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No users yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.map((user) => (
                <div key={user._id || user.id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === "ADMIN" ? "bg-red-100 text-red-600" :
                    user.role === "PARENT" ? "bg-blue-100 text-blue-600" :
                    "bg-green-100 text-green-600"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        <Card
          title="Recent Activities"
          headerAction={
            <Link to="/admin/activities" className="text-indigo-600 text-xs hover:underline font-medium">
              View all
            </Link>
          }
        >
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No activities yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentActivities.map((act) => (
                <div key={act._id || act.id} className="py-3">
                  <p className="text-sm font-medium text-gray-800">{act.title}</p>
                  <p className="text-xs text-gray-400">
                    {act.category?.replace(/_/g, " ")} · {act.ageGroup} · ⭐ {act.pointsValue} pts
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/activities"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            + Add Activity
          </Link>
          <Link
            to="/admin/users"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Manage Users
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
