/**
 * @file approvalController.js
 * @description Handles parent approval of submitted activity completions.
 * On approval: updates CompletedActivity, updates AssignedActivity status,
 * awards points to the child, and triggers the badge engine.
 */

const CompletedActivity = require("../models/CompletedActivity");
const AssignedActivity = require("../models/AssignedActivity");
const Child = require("../models/Child");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const { calculatePoints } = require("../utils/calculatePoints");
const { checkAndAwardBadges } = require("../utils/badgeEngine");

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Verifies the completed activity belongs to one of the parent's children.
 * @param {string} completedActivityId
 * @param {string} parentId
 * @returns {{ completedActivity, child } | null}
 */
const getOwnedCompletedActivity = async (completedActivityId, parentId) => {
  const completedActivity = await CompletedActivity.findById(
    completedActivityId
  ).populate("activityId", "title points difficulty requiresParentApproval");

  if (!completedActivity) return null;

  const child = await Child.findOne({
    _id: completedActivity.childId,
    parentId,
    active: true,
  });

  if (!child) return null;

  return { completedActivity, child };
};

// ─── Pending Approvals ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/approvals/pending
 * @desc    Get all pending (SUBMITTED) activity completions for the parent's children
 * @access  Private (PARENT)
 */
const getPendingApprovals = async (req, res, next) => {
  try {
    const parentId = req.user._id;

    // Find all active children belonging to this parent
    const children = await Child.find({ parentId, active: true }, "_id name");
    const childIds = children.map((c) => c._id);

    if (!childIds.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const pending = await CompletedActivity.find({
      childId: { $in: childIds },
      status: "SUBMITTED",
    })
      .populate("childId", "name age ageGroup avatar points")
      .populate("activityId", "title description category difficulty points durationMinutes")
      .populate("assignedActivityId", "dueDate assignedBy")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Approve ───────────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/approvals/activity/:completedActivityId/approve
 * @desc    Approve a submitted activity completion and award points
 * @access  Private (PARENT)
 * @body    { parentFeedback? }
 *
 * Sequence on approval:
 * 1. Mark CompletedActivity as APPROVED + set pointsAwarded + approvedBy + approvedAt
 * 2. Mark the related AssignedActivity as APPROVED
 * 3. Add points to the Child document
 * 4. Run badge engine to check for newly earned badges
 * 5. Send notification to parent
 */
const approveActivity = async (req, res, next) => {
  try {
    const { completedActivityId } = req.params;
    const { parentFeedback } = req.body;
    const parentId = req.user._id;

    const result = await getOwnedCompletedActivity(completedActivityId, parentId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or you do not have access to approve it.",
      });
    }

    const { completedActivity, child } = result;

    if (completedActivity.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. Submission status is currently "${completedActivity.status}".`,
      });
    }

    // ── Step 1: Calculate points to award ────────────────────────────────────
    const activity = completedActivity.activityId;
    const pointsToAward = calculatePoints(
      activity.points,
      activity.difficulty || "EASY"
    );

    // ── Step 2: Update CompletedActivity ─────────────────────────────────────
    completedActivity.status = "APPROVED";
    completedActivity.pointsAwarded = pointsToAward;
    completedActivity.parentFeedback = parentFeedback || "";
    completedActivity.approvedBy = parentId;
    completedActivity.approvedAt = new Date();
    await completedActivity.save();

    // ── Step 3: Update linked AssignedActivity status ─────────────────────────
    if (completedActivity.assignedActivityId) {
      await AssignedActivity.findByIdAndUpdate(
        completedActivity.assignedActivityId,
        { status: "APPROVED" }
      );
    }

    // ── Step 4: Add points to child's total ───────────────────────────────────
    child.points += pointsToAward;
    await child.save();

    // ── Step 5: Run badge engine ───────────────────────────────────────────────
    let newBadges = [];
    try {
      newBadges = await checkAndAwardBadges(child._id);
    } catch (badgeError) {
      // Badge engine failure is non-fatal — log and continue
      console.error("⚠️  Badge engine error:", badgeError.message);
    }

    // ── Step 6: Notify parent ──────────────────────────────────────────────────
    const badgeMessage =
      newBadges.length > 0
        ? ` ${child.name} also earned ${newBadges.length} new badge(s): ${newBadges.map((b) => b.name).join(", ")}!`
        : "";

    await Notification.create({
      userId: parentId,
      childId: child._id,
      message: `You approved "${activity.title}" for ${child.name}. +${pointsToAward} points awarded!${badgeMessage}`,
      type: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: `Activity approved! ${child.name} earned ${pointsToAward} points.`,
      data: {
        completedActivity,
        child: {
          _id: child._id,
          name: child.name,
          points: child.points,
        },
        pointsAwarded: pointsToAward,
        newBadges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reject ────────────────────────────────────────────────────────────────────

/**
 * @route   PUT /api/approvals/activity/:completedActivityId/reject
 * @desc    Reject a submitted activity completion with feedback
 * @access  Private (PARENT)
 * @body    { parentFeedback? }
 */
const rejectActivity = async (req, res, next) => {
  try {
    const { completedActivityId } = req.params;
    const { parentFeedback } = req.body;
    const parentId = req.user._id;

    const result = await getOwnedCompletedActivity(completedActivityId, parentId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or you do not have access to reject it.",
      });
    }

    const { completedActivity, child } = result;

    if (completedActivity.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject. Submission status is currently "${completedActivity.status}".`,
      });
    }

    // Update CompletedActivity to REJECTED
    completedActivity.status = "REJECTED";
    completedActivity.parentFeedback = parentFeedback || "";
    completedActivity.approvedBy = parentId;
    completedActivity.approvedAt = new Date();
    await completedActivity.save();

    // Reset AssignedActivity back to ASSIGNED so the child can try again
    if (completedActivity.assignedActivityId) {
      await AssignedActivity.findByIdAndUpdate(
        completedActivity.assignedActivityId,
        { status: "ASSIGNED" }
      );
    }

    // Notify parent
    await Notification.create({
      userId: parentId,
      childId: child._id,
      message: `You rejected "${completedActivity.activityId.title}" for ${child.name}. They can try again!`,
      type: "WARNING",
    });

    res.status(200).json({
      success: true,
      message: `Activity submission rejected. ${child.name} can try again.`,
      data: completedActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingApprovals, approveActivity, rejectActivity };
