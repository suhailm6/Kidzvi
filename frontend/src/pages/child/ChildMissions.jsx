import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getChildActivities, submitActivity } from "../../api/activityApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCategoryIcon, getDifficultyIcon, formatDate } from "../../utils/helpers";
import AppIcon from "../../components/common/AppIcon";

const STATUS_TABS = ["Active", "Pending", "Completed"];

const ChildMissions = () => {
  const { childId } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(null);

  const fetchActivities = useCallback(() => {
    getChildActivities(childId)
      .then((r) => {
        const data = r.data.data || r.data.activities || r.data || [];
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const tabActivities = {
    Active: activities.filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS"),
    Pending: activities.filter((a) => a.status === "PENDING_APPROVAL"),
    Completed: activities.filter((a) => a.status === "COMPLETED"),
  };

  const handleSubmit = async (assignedActivityId) => {
    setSubmittingId(assignedActivityId);
    try {
      await submitActivity(assignedActivityId, { note: submissionNote });
      setJustSubmitted(assignedActivityId);
      setSubmissionNote("");
      setExpandedId(null);
      fetchActivities();
      setTimeout(() => setJustSubmitted(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit. Try again!");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your missions..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-800">My Missions</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tabActivities[tab]?.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center"
          >
            <AppIcon name="check" className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-xl font-bold text-green-700">Awesome job!</p>
            <p className="text-green-600">Your mission has been sent to your parent for review!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Cards */}
      {tabActivities[activeTab].length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
          <p className="text-5xl mb-4">
            {activeTab === "Active" ? "Active" : activeTab === "Pending" ? "Pending" : "Done"}
          </p>
          <p className="text-2xl font-bold text-gray-700 mb-2">
            {activeTab === "Active" ? "No missions yet!" :
             activeTab === "Pending" ? "Nothing pending!" :
             "No completions yet!"}
          </p>
          <p className="text-gray-400">
            {activeTab === "Active" ? "Your parent will assign missions for you." :
             activeTab === "Pending" ? "Submit a mission to see it here." :
             "Complete some missions to see them here!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tabActivities[activeTab].map((mission, i) => {
            const id = mission._id || mission.id;
            const isExpanded = expandedId === id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all ${
                  isExpanded ? "border-indigo-300" : "border-gray-100"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl flex-shrink-0">
                      {getCategoryIcon(mission.activity?.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-gray-800">{mission.activity?.title}</h3>
                      <p className="text-gray-500 mt-1 text-sm">{mission.activity?.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                        <span className="text-yellow-600 font-bold">⭐ {mission.activity?.pointsValue} points</span>
                        <span className="text-gray-400">⏱ {mission.activity?.durationMinutes} min</span>
                        <span>{getDifficultyIcon(mission.activity?.difficulty)} {mission.activity?.difficulty}</span>
                        {mission.dueDate && (
                          <span className="text-gray-400">Due: {formatDate(mission.dueDate)}</span>
                        )}
                      </div>
                      {mission.parentNote && (
                        <div className="mt-3 p-2.5 bg-blue-50 rounded-xl">
                          <p className="text-xs text-blue-600 font-semibold">Parent's note:</p>
                          <p className="text-sm text-blue-800 mt-0.5">{mission.parentNote}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action for Active missions */}
                  {activeTab === "Active" && (
                    <div className="mt-4">
                      {!isExpanded ? (
                        <button
                          onClick={() => setExpandedId(id)}
                          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black text-lg py-3 rounded-2xl transition-all shadow-md hover:shadow-lg"
                        >
                          I Finished This
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3"
                        >
                          <textarea
                            value={submissionNote}
                            onChange={(e) => setSubmissionNote(e.target.value)}
                            placeholder="Tell your parent what you did. Optional, but helpful."
                            rows={3}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-indigo-200 focus:outline-none focus:border-indigo-400 text-sm resize-none"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setExpandedId(null); setSubmissionNote(""); }}
                              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmit(id)}
                              disabled={submittingId === id}
                              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-black py-3 rounded-2xl transition-colors"
                            >
                              {submittingId === id ? "Sending..." : "Submit"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Status for Pending */}
                  {activeTab === "Pending" && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-2xl border border-yellow-200 text-center">
                      <p className="text-yellow-700 font-bold">⏳ Waiting for parent approval...</p>
                      {mission.childNote && (
                        <p className="text-xs text-yellow-600 mt-1">Your note: "{mission.childNote}"</p>
                      )}
                    </div>
                  )}

                  {/* Status for Completed */}
                  {activeTab === "Completed" && (
                    <div className="mt-4 p-3 bg-green-50 rounded-2xl border border-green-200 text-center">
                      <p className="text-green-700 font-bold">Completed. +{mission.activity?.pointsValue} points earned.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildMissions;
