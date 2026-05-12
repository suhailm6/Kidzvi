import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getChild } from "../../api/parentApi";
import { getChildActivities } from "../../api/activityApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCategoryIcon } from "../../utils/helpers";
import AppIcon from "../../components/common/AppIcon";

const ChildDashboard = () => {
  const { childId } = useParams();
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting] = useState(() => {
    const greetings = [
      "You're doing amazing.",
      "Keep up the great work.",
      "You're making steady progress.",
      "Ready for today's missions?",
      "Let's have a great day.",
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  useEffect(() => {
    Promise.all([
      getChild(childId)
        .then((r) => setChild(r.data.data || r.data.child || r.data || null))
        .catch(() => {}),
      getChildActivities(childId)
        .then((r) => {
          const data = r.data.data || r.data.activities || r.data || [];
          setActivities(Array.isArray(data) ? data : []);
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [childId]);

  const todayMissions = activities.filter(
    (a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS"
  ).slice(0, 3);

  const completed = activities.filter((a) => a.status === "COMPLETED").length;
  const total = activities.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const points = child?.points ?? user?.points ?? 0;
  const childName = child?.name || user?.name || "Friend";

  if (loading) return <LoadingSpinner text="Loading your adventures..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium mb-1">Hello there!</p>
            <h1 className="text-3xl font-bold">{childName.split(" ")[0]}</h1>
            <p className="text-purple-200 mt-2 text-lg">{greeting}</p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/15 items-center justify-center">
            <AppIcon name="badge" className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Points + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-md"
        >
          <p className="text-yellow-100 font-medium mb-2 text-lg">My Points</p>
          <p className="text-5xl font-black">{points}</p>
          <p className="text-yellow-100 mt-2">points earned!</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
        >
          <p className="text-gray-500 font-medium mb-3 text-lg">My Progress</p>
          <div className="flex items-end gap-2 mb-3">
            <p className="text-4xl font-black text-indigo-600">{completed}</p>
            <p className="text-gray-400 text-lg mb-1">/ {total} missions</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progressPct}% complete!</p>
        </motion.div>
      </div>

      {/* Today's Missions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Today's Missions</h2>
          <Link
            to={`/child/${childId}/missions`}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            See all →
          </Link>
        </div>

        {todayMissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <AppIcon name="check" className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-700 mb-2">All done!</p>
            <p className="text-gray-400">No missions left for today. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {todayMissions.map((mission, i) => (
              <motion.div
                key={mission._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl flex-shrink-0">
                  {getCategoryIcon(mission.activity?.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800">{mission.activity?.title}</h3>
                  <p className="text-sm text-gray-400">
                    {mission.activity?.pointsValue} points · {mission.activity?.durationMinutes} min
                  </p>
                </div>
                <Link
                  to={`/child/${childId}/missions`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
                >
                  Start
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "target", label: "Missions", path: `/child/${childId}/missions`, bg: "bg-blue-50", text: "text-blue-700" },
          { icon: "gift", label: "Rewards", path: `/child/${childId}/rewards`, bg: "bg-yellow-50", text: "text-yellow-700" },
          { icon: "badge", label: "Badges", path: `/child/${childId}/badges`, bg: "bg-purple-50", text: "text-purple-700" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${item.bg} ${item.text} rounded-2xl p-5 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <AppIcon name={item.icon} className="w-8 h-8" />
            <span className="font-bold text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChildDashboard;
