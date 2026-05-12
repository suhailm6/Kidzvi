import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid,
} from "recharts";
import { getChildren } from "../../api/parentApi";
import { getSummary, getWeekly, getCategoryDistribution } from "../../api/reportApi";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCategoryIcon } from "../../utils/helpers";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#f97316", "#14b8a6", "#ef4444", "#6b7280"];

const ReportsPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("all");
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildren()
      .then((r) => {
        const kids = r.data.data || r.data.children || r.data || [];
        setChildren(Array.isArray(kids) ? kids : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const childId = selectedChild === "all" ? undefined : selectedChild;

    Promise.all([
      getSummary(childId).then((r) => setSummary(r.data.data || r.data)).catch(() => {}),
      getWeekly(childId).then((r) => {
        const data = r.data.data || r.data.weekly || r.data || [];
        setWeekly(Array.isArray(data) ? data : []);
      }).catch(() => {}),
      getCategoryDistribution(childId).then((r) => {
        const data = r.data.data || r.data.categories || r.data || [];
        setCategories(Array.isArray(data) ? data : []);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [selectedChild]);

  const stats = [
    { icon: "check", label: "Total Completed", value: summary?.totalCompleted ?? 0, color: "green" },
    { icon: "trophy", label: "Total Points Earned", value: summary?.totalPoints ?? 0, color: "yellow" },
    { icon: "target", label: "Current Streak", value: summary?.currentStreak ? `${summary.currentStreak}d` : "0d", color: "orange" },
    { icon: "chart", label: "This Month", value: summary?.thisMonth ?? 0, color: "indigo" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your children's progress over time</p>
        </div>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        >
          <option value="all">All Children</option>
          {children.map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.08} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Weekly Bar Chart */}
            <Card title="Weekly Activity" subtitle="Completions per day" className="lg:col-span-3">
              {weekly.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm font-semibold mb-2">No chart data</p>
                  <p className="text-sm">No data available yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weekly} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Category Pie Chart */}
            <Card title="By Category" subtitle="Distribution" className="lg:col-span-2">
              {categories.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm font-semibold mb-2">No category data</p>
                  <p className="text-sm">No data available yet.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="category"
                      >
                        {categories.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, name?.replace(/_/g, " ")]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {categories.map((cat, idx) => (
                      <div key={cat.category} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-gray-600 flex-1">{getCategoryIcon(cat.category)} {cat.category?.replace(/_/g, " ")}</span>
                        <span className="font-semibold text-gray-700">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
