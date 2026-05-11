/**
 * @file rewardController.js
 * @description Manages rewards: creation, listing, claiming, and approval lifecycle.
 * Rewards are created by parents and claimed by children (via parent interface).
 * Claim lifecycle: REQUESTED → APPROVED | REJECTED → COMPLETED
 */

const Reward = require("../models/Reward");
const RewardClaim = require("../models/RewardClaim");
const Child = require("../models/Child");
const Notification = require("../models/Notification");

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Verifies that a child belongs to the authenticated parent.
 */
const getOwnedChild = async (childId, parentId) => {
  return Child.findOne({ _id: childId, parentId, active: true });
};

// ─── Reward CRUD ───────────────────────────────────────────────────────────────

/**
 * @route   POST /api/rewards
 * @desc    Create a new reward for a child or all children
 * @access  Private (PARENT)
 * @body    { title, description?, pointsRequired, rewardType?, childId? }
 */
const createReward = async (req, res, next) => {
  try {
    const { title, description, pointsRequired, rewardType, childId } = req.body;
    const parentId = req.user._id;

    // If childId is provided, verify ownership
    if (childId) {
      const child = await getOwnedChild(childId, parentId);
      if (!child) {
        return res.status(404).json({
          success: false,
          message: "Child not found or you do not have access to this profile.",
        });
      }
    }

    const reward = await Reward.create({
      parentId,
      childId: childId || null,
      title,
      description: description || "",
      pointsRequired,
      rewardType: rewardType || "FAMILY",
    });

    res.status(201).json({
      success: true,
      message: "Reward created successfully.",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rewards
 * @desc    Get all active rewards created by the authenticated parent
 * @access  Private (PARENT)
 */
const getParentRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({
      parentId: req.user._id,
      isActive: true,
    })
      .populate("childId", "name age ageGroup")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rewards/:childId
 * @desc    Get all active rewards available for a specific child
 * @access  Private (PARENT)
 */
const getRewards = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    const child = await getOwnedChild(childId, parentId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Get rewards: child-specific OR general (no childId) for this parent
    const rewards = await Reward.find({
      parentId,
      isActive: true,
      $or: [{ childId: child._id }, { childId: null }],
    }).sort({ pointsRequired: 1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      childPoints: child.points,
      data: rewards.map((r) => ({
        ...r.toObject(),
        canClaim: child.points >= r.pointsRequired,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/rewards/:rewardId
 * @desc    Update a reward
 * @access  Private (PARENT — must own the reward)
 */
const updateReward = async (req, res, next) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.rewardId,
      parentId: req.user._id,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or you do not have access to this reward.",
      });
    }

    const allowedUpdates = ["title", "description", "pointsRequired", "rewardType", "isActive"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        reward[field] = req.body[field];
      }
    });

    await reward.save();

    res.status(200).json({
      success: true,
      message: "Reward updated successfully.",
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/rewards/:rewardId
 * @desc    Deactivate (soft-delete) a reward
 * @access  Private (PARENT — must own the reward)
 */
const deleteReward = async (req, res, next) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.rewardId,
      parentId: req.user._id,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or you do not have access to this reward.",
      });
    }

    reward.isActive = false;
    await reward.save();

    res.status(200).json({
      success: true,
      message: "Reward has been deactivated.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reward Claims ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/rewards/:rewardId/claim
 * @desc    Child claims a reward (deducts points immediately upon approval)
 * @access  Private (PARENT on behalf of child)
 * @body    { childId }
 */
const claimReward = async (req, res, next) => {
  try {
    const { rewardId } = req.params;
    const { childId } = req.body;
    const parentId = req.user._id;

    // Verify child ownership
    const child = await getOwnedChild(childId, parentId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Verify the reward exists and belongs to this parent
    const reward = await Reward.findOne({
      _id: rewardId,
      parentId,
      isActive: true,
      $or: [{ childId: child._id }, { childId: null }],
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or is not available for this child.",
      });
    }

    // Check if child has enough points
    if (child.points < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Not enough points. ${child.name} needs ${reward.pointsRequired} points but has ${child.points}.`,
      });
    }

    // Prevent duplicate pending claims for the same reward
    const existingClaim = await RewardClaim.findOne({
      rewardId,
      childId,
      status: { $in: ["REQUESTED", "APPROVED"] },
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "A pending claim for this reward already exists.",
      });
    }

    const claim = await RewardClaim.create({
      rewardId,
      childId,
      parentId,
      status: "REQUESTED",
    });

    // Notify parent of pending claim
    await Notification.create({
      userId: parentId,
      childId,
      message: `${child.name} has requested the reward: "${reward.title}" (${reward.pointsRequired} points).`,
      type: "ACTION",
    });

    res.status(201).json({
      success: true,
      message: `Reward claim submitted for "${reward.title}". Awaiting parent approval.`,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rewards/claims/pending
 * @desc    Get all pending reward claims for the authenticated parent
 * @access  Private (PARENT)
 */
const getPendingClaims = async (req, res, next) => {
  try {
    const claims = await RewardClaim.find({
      parentId: req.user._id,
      status: "REQUESTED",
    })
      .populate("rewardId", "title description pointsRequired rewardType")
      .populate("childId", "name age avatar points")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/rewards/claims/:claimId/approve
 * @desc    Approve a reward claim and deduct points from the child
 * @access  Private (PARENT)
 * @body    { parentNote? }
 */
const approveClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { parentNote } = req.body;
    const parentId = req.user._id;

    const claim = await RewardClaim.findOne({
      _id: claimId,
      parentId,
    }).populate("rewardId", "title pointsRequired");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found or you do not have access to this claim.",
      });
    }

    if (claim.status !== "REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve. Claim status is currently "${claim.status}".`,
      });
    }

    // Fetch the child to check/deduct points
    const child = await Child.findById(claim.childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found.",
      });
    }

    const reward = claim.rewardId;

    // Re-check points at approval time
    if (child.points < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points at time of approval. ${child.name} has ${child.points} but needs ${reward.pointsRequired}.`,
      });
    }

    // Deduct points from child
    child.points -= reward.pointsRequired;
    await child.save();

    // Update claim
    claim.status = "APPROVED";
    claim.parentNote = parentNote || "";
    await claim.save();

    await Notification.create({
      userId: parentId,
      childId: child._id,
      message: `Reward claim for "${reward.title}" approved! ${reward.pointsRequired} points deducted from ${child.name}.`,
      type: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: `Reward claim approved! ${reward.pointsRequired} points deducted from ${child.name}.`,
      data: {
        claim,
        child: { _id: child._id, name: child.name, points: child.points },
        pointsDeducted: reward.pointsRequired,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/rewards/claims/:claimId/reject
 * @desc    Reject a reward claim
 * @access  Private (PARENT)
 * @body    { parentNote? }
 */
const rejectClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { parentNote } = req.body;
    const parentId = req.user._id;

    const claim = await RewardClaim.findOne({
      _id: claimId,
      parentId,
    }).populate("rewardId", "title");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found or you do not have access to this claim.",
      });
    }

    if (claim.status !== "REQUESTED") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject. Claim status is currently "${claim.status}".`,
      });
    }

    claim.status = "REJECTED";
    claim.parentNote = parentNote || "";
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Reward claim rejected.",
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/rewards/claims/:claimId/complete
 * @desc    Mark a reward claim as completed (reward fulfilled)
 * @access  Private (PARENT)
 */
const completeClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const parentId = req.user._id;

    const claim = await RewardClaim.findOne({
      _id: claimId,
      parentId,
    }).populate("rewardId", "title");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found or you do not have access to this claim.",
      });
    }

    if (claim.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as complete. Claim must be APPROVED first. Current status: "${claim.status}".`,
      });
    }

    claim.status = "COMPLETED";
    await claim.save();

    res.status(200).json({
      success: true,
      message: `Reward "${claim.rewardId.title}" marked as completed — enjoy!`,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReward,
  getParentRewards,
  getRewards,
  updateReward,
  deleteReward,
  claimReward,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  completeClaim,
};
