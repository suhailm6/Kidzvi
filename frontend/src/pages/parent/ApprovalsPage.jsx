import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPendingApprovals, approveActivity, rejectActivity } from "../../api/activityApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getCategoryIcon, formatDateTime } from "../../utils/helpers";

const ApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = useCallback(() => {
    setLoading(true);
    getPendingApprovals()
      .then((res) => {
        const data = res.data.data || res.data.approvals || res.data || [];
        setApprovals(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveActivity(id, {});
      setApprovals((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal._id || rejectModal.id);
    try {
      await rejectActivity(rejectModal._id || rejectModal.id, { reason: rejectNote });
      setApprovals((prev) => prev.filter((a) => (a._id || a.id) !== (rejectModal._id || rejectModal.id)));
      setRejectModal(null);
      setRejectNote("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading approvals..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Activity Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review activities your children have marked as complete
        </p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-gray-400 mb-4">No pending approvals</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
            <p className="text-gray-400">No activities waiting for your approval.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {approvals.length} {approvals.length === 1 ? "activity" : "activities"} waiting for review
          </p>
          <AnimatePresence>
            {approvals.map((approval) => (
              <motion.div
                key={approval._id || approval.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {getCategoryIcon(approval.activity?.category || approval.activityCategory)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-gray-800">
                            {approval.activity?.title || approval.activityTitle}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            by <span className="font-semibold text-indigo-600">{approval.child?.name || approval.childName}</span>
                            {" · "}
                            <span className="text-gray-400">{formatDateTime(approval.submittedAt || approval.completedAt || approval.createdAt)}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
                          Pending
                        </div>
                      </div>

                      {/* Child's Note */}
                      {(approval.childNote || approval.note) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-300">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Child's Note:</p>
                          <p className="text-sm text-blue-800 italic">
                            "{approval.childNote || approval.note}"
                          </p>
                        </div>
                      )}

                      {/* Activity Points */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{approval.activity?.pointsValue || approval.pointsValue} pts to award</span>
                        {approval.activity?.durationMinutes && (
                          <span>{approval.activity.durationMinutes} min</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(approval._id || approval.id)}
                      loading={processingId === (approval._id || approval.id)}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectModal(approval)}
                      disabled={processingId === (approval._id || approval.id)}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectNote(""); }}
        title="Reject Activity"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Why are you rejecting{" "}
          <span className="font-semibold">{rejectModal?.activity?.title || rejectModal?.activityTitle}</span>?
          (Optional)
        </p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="e.g. Please try again and put more effort in..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none mb-4"
        />
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => { setRejectModal(null); setRejectNote(""); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={!!processingId}
            onClick={handleReject}
          >
            Confirm Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalsPage;
