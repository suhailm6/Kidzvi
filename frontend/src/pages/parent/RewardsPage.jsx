import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getRewards, createReward, deleteReward } from "../../api/rewardApi";
import { getChildren } from "../../api/parentApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { REWARD_TYPES } from "../../utils/constants";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  pointsRequired: z.coerce.number().min(1, "Must be at least 1 point"),
  rewardType: z.string().min(1, "Select a reward type"),
  childId: z.string().optional(),
});

const REWARD_TYPE_ICONS = {
  FAMILY: "👨‍👩‍👧",
  PHYSICAL: "🎁",
  CREATIVE: "🎨",
  TOY: "🧸",
  DIGITAL: "📱",
  OTHER: "⭐",
};

const RewardsPage = () => {
  const [rewards, setRewards] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getRewards().then((r) => {
        const data = r.data.data || r.data.rewards || r.data || [];
        setRewards(Array.isArray(data) ? data : []);
      }),
      getChildren().then((r) => {
        const kids = r.data.data || r.data.children || r.data || [];
        setChildren(Array.isArray(kids) ? kids : []);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await createReward(data);
      reset();
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create reward.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reward?")) return;
    try {
      await deleteReward(id);
      setRewards((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } catch {
      alert("Failed to delete reward.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading rewards..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rewards</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create rewards your children can redeem with points</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Create Reward</Button>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎁</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No rewards yet</h3>
            <p className="text-gray-400 mb-6">Create rewards your children can work toward.</p>
            <Button onClick={() => setModalOpen(true)}>Create First Reward</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {rewards.map((reward, i) => (
              <motion.div
                key={reward._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">
                    {REWARD_TYPE_ICONS[reward.rewardType] || "⭐"}
                  </div>
                  <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">
                    ⭐ {reward.pointsRequired} pts
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">{reward.title}</h3>
                {reward.description && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{reward.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{reward.rewardType?.replace(/_/g, " ")}</span>
                  <button
                    onClick={() => handleDelete(reward._id || reward.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); setServerError(""); }} title="Create New Reward">
        {serverError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Title *</label>
            <input
              type="text"
              placeholder="e.g. Extra Screen Time"
              {...register("title")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Describe this reward..."
              {...register("description")}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Required *</label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 50"
                {...register("pointsRequired")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
              {errors.pointsRequired && <p className="text-xs text-red-500 mt-1">{errors.pointsRequired.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                {...register("rewardType")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              >
                <option value="">Select type</option>
                {REWARD_TYPES.map((t) => (
                  <option key={t} value={t}>{REWARD_TYPE_ICONS[t]} {t}</option>
                ))}
              </select>
              {errors.rewardType && <p className="text-xs text-red-500 mt-1">{errors.rewardType.message}</p>}
            </div>
          </div>

          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to child (optional)</label>
              <select
                {...register("childId")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              >
                <option value="">All children</option>
                {children.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Create Reward
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RewardsPage;
