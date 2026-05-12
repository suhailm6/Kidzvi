import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getChild } from "../../api/parentApi";
import { getChildActivities } from "../../api/activityApi";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Badge from "../../components/common/Badge";
import { formatDate, getCategoryIcon, getAgeGroup } from "../../utils/helpers";

const TABS = ["Overview", "Activities", "Progress"];

const ChildProfile = () => {
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    Promise.all([
      getChild(childId).then((r) => setChild(r.data.data || r.data.child || r.data)),
      getChildActivities(childId).then((r) => {
        const acts = r.data.data || r.data.activities || r.data || [];
        setActivities(Array.isArray(acts) ? acts : []);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [childId]);

  if (loading) return <LoadingSpinner text="Loading child profile..." />;
  if (!child) return <div className="text-center py-16 text-gray-400">Child not found.</div>;

  const completedCount = activities.filter((a) => a.status === "COMPLETED").length;
  const pendingCount = activities.filter((a) => a.status === "PENDING_APPROVAL").length;
  const assignedCount = activities.filter((a) => a.status === "ASSIGNED").length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/parent/children" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Children
      </Link>

      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
            {child.name?.[0]?.toUpperCase() || "C"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{child.name}</h1>
            <p className="text-gray-500">
              Age {child.age} · {child.ageGroup || getAgeGroup(child.age)}
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl">
                <span>Points</span>
                <span className="text-sm font-bold text-yellow-700">{child.points || 0} Points</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl">
                <span>Done</span>
                <span className="text-sm font-bold text-green-700">{completedCount} Completed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl">
                <span>Pending</span>
                <span className="text-sm font-bold text-orange-700">{pendingCount} Pending</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/child/${childId}/dashboard`}
              className="text-sm font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl transition-colors"
            >
              Child View →
            </Link>
            <Link
              to={`/parent/settings?child=${childId}`}
              className="text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Activity Summary">
              <div className="space-y-3">
                {[
                  { label: "Completed", count: completedCount, color: "bg-green-100 text-green-700" },
                  { label: "Pending Approval", count: pendingCount, color: "bg-yellow-100 text-yellow-700" },
                  { label: "Assigned", count: assignedCount, color: "bg-blue-100 text-blue-700" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Recent Activities">
              {activities.slice(0, 5).map((act) => (
                <div key={act._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{getCategoryIcon(act.activity?.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{act.activity?.title || "Activity"}</p>
                    <p className="text-xs text-gray-400">{formatDate(act.dueDate)}</p>
                  </div>
                  <Badge
                    label={act.status?.replace(/_/g, " ")}
                    color={act.status === "COMPLETED" ? "green" : act.status === "PENDING_APPROVAL" ? "yellow" : "blue"}
                  />
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No activities assigned yet.</p>
              )}
            </Card>
          </div>
        )}

        {activeTab === "Activities" && (
          <Card title="All Assigned Activities">
            {activities.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-semibold text-gray-400 mb-3">No activities assigned</p>
                <p className="text-gray-400">No activities assigned to {child.name} yet.</p>
                <Link to="/parent/assign-activities" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">
                  Assign an activity →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activities.map((act) => (
                  <div key={act._id} className="flex items-center gap-4 py-3">
                    <span className="text-2xl">{getCategoryIcon(act.activity?.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{act.activity?.title}</p>
                      <p className="text-xs text-gray-400">
                        Due: {formatDate(act.dueDate)} · {act.activity?.pointsValue} pts
                      </p>
                    </div>
                    <Badge
                      label={act.status?.replace(/_/g, " ")}
                      color={act.status === "COMPLETED" ? "green" : act.status === "PENDING_APPROVAL" ? "yellow" : "blue"}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === "Progress" && (
          <Card title="Progress Overview">
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-gray-400 mb-4">Progress details</p>
              <p className="text-gray-500">Detailed progress charts are available in</p>
              <Link to="/parent/reports" className="text-indigo-600 font-medium hover:underline">
                Reports & Analytics →
              </Link>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default ChildProfile;
