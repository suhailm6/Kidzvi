import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { getChildren } from "../../api/parentApi";
import { getActivities, assignActivity } from "../../api/activityApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CATEGORIES } from "../../utils/constants";
import { getCategoryIcon, getDifficultyIcon } from "../../utils/helpers";

const AssignActivities = () => {
  const location = useLocation();
  const preselectedActivityId = location.state?.activityId;

  const [children, setChildren] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(preselectedActivityId || "");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getChildren().then((r) => {
        const kids = r.data.data || r.data.children || r.data || [];
        setChildren(Array.isArray(kids) ? kids : []);
      }),
      getActivities().then((r) => {
        const acts = r.data.data || r.data.activities || r.data || [];
        setActivities(Array.isArray(acts) ? acts : []);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredActivities = activities.filter((a) => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const selectedActivityData = activities.find(
    (a) => (a._id || a.id) === selectedActivity
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChild || !selectedActivity) {
      setError("Please select both a child and an activity.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await assignActivity({
        childId: selectedChild,
        activityId: selectedActivity,
        dueDate: dueDate || undefined,
        note,
      });
      setSuccess(true);
      setSelectedActivity("");
      setDueDate("");
      setNote("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign activity.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Assign Activities</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select a child and activity, then set a due date.</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
        >
          Activity assigned successfully.
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <Card title="Assignment Details" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Child Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Child *</label>
              {children.length === 0 ? (
                <p className="text-sm text-gray-400">No children added yet.</p>
              ) : (
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                >
                  <option value="">— Choose child —</option>
                  {children.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} (Age {c.age})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Activity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selected Activity *</label>
              {selectedActivityData ? (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-800">{selectedActivityData.title}</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    ⭐ {selectedActivityData.pointsValue} pts · ⏱ {selectedActivityData.durationMinutes} min
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedActivity("")}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Change activity
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 p-3 bg-gray-50 rounded-xl">
                  Select an activity from the list →
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note to child <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Remember to do this before dinner!"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none"
              />
            </div>

            <Button
              type="submit"
              loading={submitting}
              disabled={!selectedChild || !selectedActivity}
              className="w-full"
            >
              Assign Activity
            </Button>
          </form>
        </Card>

        {/* Activity Browser */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Choose Activity">
            {/* Search & Filter */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{getCategoryIcon(c)} {c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredActivities.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">No activities found.</p>
              ) : (
                filteredActivities.map((activity) => {
                  const isSelected = selectedActivity === (activity._id || activity.id);
                  return (
                    <button
                      key={activity._id || activity.id}
                      type="button"
                      onClick={() => setSelectedActivity(activity._id || activity.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3
                        ${isSelected
                          ? "border-indigo-400 bg-indigo-50 shadow-sm"
                          : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                        }`}
                    >
                      <span className="text-2xl flex-shrink-0">{getCategoryIcon(activity.category)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-400">
                          {getDifficultyIcon(activity.difficulty)} {activity.difficulty} ·
                          ⭐ {activity.pointsValue} pts ·
                          ⏱ {activity.durationMinutes} min ·
                          {activity.ageGroup}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-indigo-600 flex-shrink-0 text-xs font-semibold">Selected</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignActivities;
