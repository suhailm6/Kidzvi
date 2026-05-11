import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPendingClaims,
  approveRewardClaim,
  rejectRewardClaim,
  completeRewardClaim,
} from "../../api/rewardApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDateTime } from "../../utils/helpers";

const REWARD_TYPE_ICONS = {
  FAMILY: "👨‍👩‍👧",
  PHYSICAL: "🎁",
  CREATIVE: "🎨",
  TOY: "🧸",
  DIGITAL: "📱",
  OTHER: "⭐",
};

const RewardClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchClaims = useCallback(() => {
    setLoading(true);
    getPendingClaims()
      .then((res) => {
        const data = res.data.data || res.data.claims || res.data || [];
        setClaims(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleAction = async (id, action, data = {}) => {
    setProcessingId(id);
    try {
      if (action === "approve") await approveRewardClaim(id);
      else if (action === "reject") await rejectRewardClaim(id, data);
      else if (action === "complete") await completeRewardClaim(id);
      setClaims((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action}.`);
    } finally {
      setProcessingId(null);
      setRejectModal(null);
      setRejectReason("");
    }
  };

  if (loading) return <LoadingSpinner text="Loading reward claims..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reward Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage reward requests from your children
        </p>
      </div>

      {claims.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No pending claims</h3>
            <p className="text-gray-400">Your children haven't requested any rewards yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {claims.length} pending {claims.length === 1 ? "claim" : "claims"}
          </p>
          <AnimatePresence>
            {claims.map((claim) => {
              const id = claim._id || claim.id;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {REWARD_TYPE_ICONS[claim.reward?.rewardType] || "🎁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-gray-800">
                            {claim.reward?.title || claim.rewardTitle}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Requested by{" "}
                            <span className="font-semibold text-indigo-600">
                              {claim.child?.name || claim.childName}
                            </span>
                            {" · "}
                            <span className="text-gray-400">
                              {formatDateTime(claim.requestedAt || claim.createdAt)}
                            </span>
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                          claim.status === "PENDING" ? "bg-yellow-50 text-yellow-700" :
                          claim.status === "APPROVED" ? "bg-blue-50 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {claim.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>⭐ {claim.reward?.pointsRequired || claim.pointsRequired} pts</span>
                        <span>Type: {claim.reward?.rewardType || claim.rewardType}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-50">
                        {claim.status === "PENDING" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleAction(id, "approve")}
                              loading={processingId === id}
                            >
                              ✅ Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setRejectModal(claim)}
                              disabled={processingId === id}
                            >
                              ❌ Reject
                            </Button>
                          </>
                        )}
                        {claim.status === "APPROVED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAction(id, "complete")}
                            loading={processingId === id}
                          >
                            🎉 Mark as Given
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(""); }}
        title="Reject Reward Claim"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Rejecting{" "}
          <span className="font-semibold">{rejectModal?.reward?.title || rejectModal?.rewardTitle}</span>.
          Add a reason (optional):
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. You need more points first..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none mb-4"
        />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => { setRejectModal(null); setRejectReason(""); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={!!processingId}
            onClick={() => handleAction(rejectModal._id || rejectModal.id, "reject", { reason: rejectReason })}
          >
            Confirm Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RewardClaims;
