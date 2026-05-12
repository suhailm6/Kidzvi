import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getRewards, claimReward } from "../../api/rewardApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AppIcon from "../../components/common/AppIcon";

const REWARD_TYPE_ICONS = {
  FAMILY: "users",
  PHYSICAL: "target",
  CREATIVE: "sparkle",
  TOY: "gift",
  DIGITAL: "list",
  OTHER: "gift",
};

const ChildRewards = () => {
  const { childId } = useParams();
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimedIds, setClaimedIds] = useState([]);

  const points = user?.points ?? 0;

  useEffect(() => {
    getRewards(childId)
      .then((r) => {
        const data = r.data.data || r.data.rewards || r.data || [];
        setRewards(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [childId]);

  const handleClaim = async (rewardId) => {
    setClaimingId(rewardId);
    try {
      await claimReward(rewardId, { childId });
      setClaimedIds((prev) => [...prev, rewardId]);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't claim reward. Try again!");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading rewards..." />;

  const affordable = rewards.filter((r) => r.pointsRequired <= points);
  const locked = rewards.filter((r) => r.pointsRequired > points);

  return (
    <div className="space-y-6">
      {/* Points Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white text-center shadow-lg"
      >
        <p className="text-xl font-bold mb-1">Your Points</p>
        <p className="text-6xl font-black">{points}</p>
        <p className="text-yellow-100 mt-2">Keep completing missions to earn more!</p>
      </motion.div>

      <h1 className="text-3xl font-black text-gray-800">Rewards Shop</h1>

      {rewards.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
          <AppIcon name="gift" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-2xl font-bold text-gray-700">No rewards yet!</p>
          <p className="text-gray-400">Ask your parent to add some rewards for you.</p>
        </div>
      ) : (
        <>
          {/* Affordable Rewards */}
          {affordable.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-green-700 mb-3">Available rewards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {affordable.map((reward, i) => {
                  const id = reward._id || reward.id;
                  const claimed = claimedIds.includes(id);
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-3xl border-2 border-green-200 shadow-md p-5"
                    >
                      <div className="text-center mb-4">
                        <AppIcon name={REWARD_TYPE_ICONS[reward.rewardType] || "gift"} className="w-10 h-10 mx-auto text-green-600" />
                        <h3 className="text-xl font-black text-gray-800 mt-3">{reward.title}</h3>
                        {reward.description && (
                          <p className="text-gray-500 text-sm mt-1">{reward.description}</p>
                        )}
                      </div>
                      <div className="bg-yellow-50 rounded-2xl p-3 text-center mb-4">
                        <p className="text-2xl font-black text-yellow-600">{reward.pointsRequired} points</p>
                      </div>
                      {claimed ? (
                        <div className="bg-green-50 rounded-2xl p-3 text-center">
                          <p className="text-green-600 font-bold">Requested. Waiting for parent approval.</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaim(id)}
                          disabled={claimingId === id}
                          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black text-lg py-3 rounded-2xl transition-all disabled:opacity-60 shadow-md"
                        >
                          {claimingId === id ? "Sending request..." : "Claim Reward"}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Rewards */}
          {locked.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-500 mb-3">Earn more points to unlock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locked.map((reward, i) => {
                  const needed = reward.pointsRequired - points;
                  return (
                    <motion.div
                      key={reward._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-gray-50 rounded-3xl border-2 border-gray-200 p-5 opacity-75"
                    >
                      <div className="text-center mb-4">
                        <AppIcon name={REWARD_TYPE_ICONS[reward.rewardType] || "gift"} className="w-10 h-10 mx-auto text-gray-400" />
                        <h3 className="text-xl font-black text-gray-600 mt-3">{reward.title}</h3>
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-3 text-center mb-3">
                        <p className="text-xl font-black text-gray-500">{reward.pointsRequired} points</p>
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-3 text-center">
                        <p className="text-orange-600 font-bold text-sm">
                          Need {needed} more points
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                          <div
                            className="h-2 bg-orange-400 rounded-full transition-all"
                            style={{ width: `${Math.min((points / reward.pointsRequired) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChildRewards;
