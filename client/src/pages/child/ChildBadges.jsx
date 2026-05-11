import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getChildActivities } from "../../api/activityApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const BADGE_DEFINITIONS = [
  { id: "first_mission", icon: "🚀", title: "First Mission!", desc: "Complete your very first mission", color: "bg-blue-100 border-blue-300", req: (stats) => stats.totalCompleted >= 1 },
  { id: "five_missions", icon: "🌟", title: "Rising Star", desc: "Complete 5 missions", color: "bg-yellow-100 border-yellow-300", req: (stats) => stats.totalCompleted >= 5 },
  { id: "ten_missions", icon: "🏆", title: "Champion", desc: "Complete 10 missions", color: "bg-orange-100 border-orange-300", req: (stats) => stats.totalCompleted >= 10 },
  { id: "twenty_five", icon: "👑", title: "Legend", desc: "Complete 25 missions", color: "bg-purple-100 border-purple-300", req: (stats) => stats.totalCompleted >= 25 },
  { id: "reader", icon: "📚", title: "Bookworm", desc: "Complete a Language activity", color: "bg-blue-100 border-blue-300", req: (stats) => stats.categories.LANGUAGE >= 1 },
  { id: "mathematician", icon: "🔢", title: "Math Wizard", desc: "Complete a Math activity", color: "bg-purple-100 border-purple-300", req: (stats) => stats.categories.MATH_LOGIC >= 1 },
  { id: "artist", icon: "🎨", title: "Little Artist", desc: "Complete a Creativity activity", color: "bg-pink-100 border-pink-300", req: (stats) => stats.categories.CREATIVITY >= 1 },
  { id: "runner", icon: "🏃", title: "Active Hero", desc: "Complete a Physical Activity", color: "bg-green-100 border-green-300", req: (stats) => stats.categories.PHYSICAL_ACTIVITY >= 1 },
  { id: "responsible", icon: "⭐", title: "Responsible", desc: "Complete a Responsibility activity", color: "bg-teal-100 border-teal-300", req: (stats) => stats.categories.RESPONSIBILITY >= 1 },
  { id: "family", icon: "👨‍👩‍👧", title: "Family Star", desc: "Complete a Family Bonding activity", color: "bg-red-100 border-red-300", req: (stats) => stats.categories.FAMILY_BONDING >= 1 },
  { id: "hundred_points", icon: "💯", title: "Century!", desc: "Earn 100 points total", color: "bg-yellow-100 border-yellow-300", req: (stats) => stats.totalPoints >= 100 },
  { id: "five_hundred", icon: "💎", title: "Diamond", desc: "Earn 500 points total", color: "bg-indigo-100 border-indigo-300", req: (stats) => stats.totalPoints >= 500 },
];

const ChildBadges = () => {
  const { childId } = useParams();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildActivities(childId)
      .then((r) => {
        const data = r.data.data || r.data.activities || r.data || [];
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [childId]);

  const completed = activities.filter((a) => a.status === "COMPLETED");

  const stats = {
    totalCompleted: completed.length,
    totalPoints: user?.points ?? 0,
    categories: completed.reduce((acc, a) => {
      const cat = a.activity?.category;
      if (cat) acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}),
  };

  const earned = BADGE_DEFINITIONS.filter((b) => b.req(stats));
  const locked = BADGE_DEFINITIONS.filter((b) => !b.req(stats));

  const encouragements = [
    "You're amazing! Keep going! 🚀",
    "Every mission makes you stronger! 💪",
    "You're a superstar! ⭐",
    "Keep collecting those badges! 🏅",
  ];

  if (loading) return <LoadingSpinner text="Loading your badges..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-800">🏅 My Badges</h1>
        <p className="text-gray-500 mt-1">
          {earned.length > 0
            ? `${encouragements[earned.length % encouragements.length]}`
            : "Complete missions to earn your first badge!"}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-5 text-white flex items-center justify-around">
        <div className="text-center">
          <p className="text-3xl font-black">{earned.length}</p>
          <p className="text-purple-200 text-sm font-medium">Earned</p>
        </div>
        <div className="w-px h-12 bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-black">{BADGE_DEFINITIONS.length}</p>
          <p className="text-purple-200 text-sm font-medium">Total</p>
        </div>
        <div className="w-px h-12 bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-black">⭐{user?.points ?? 0}</p>
          <p className="text-purple-200 text-sm font-medium">Points</p>
        </div>
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">✨ Earned Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                className={`${badge.color} border-2 rounded-3xl p-5 text-center shadow-md`}
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <h3 className="text-base font-black text-gray-800">{badge.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-500 mb-4">🔒 Badges to Unlock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-100 border-2 border-gray-200 rounded-3xl p-5 text-center opacity-60"
              >
                <div className="text-5xl mb-3 grayscale">{badge.icon}</div>
                <h3 className="text-base font-bold text-gray-600">{badge.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
                <div className="mt-2 bg-gray-200 rounded-full px-2 py-0.5 inline-block">
                  <span className="text-xs text-gray-500 font-medium">🔒 Locked</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-10">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-xl font-bold text-gray-600">Your badge collection is empty!</p>
          <p className="text-gray-400">Complete missions to start earning badges. You can do it! 🚀</p>
        </div>
      )}
    </div>
  );
};

export default ChildBadges;
