/**
 * @file parentController.js
 * @description Handles parent-specific operations: dashboard stats,
 * child profile management, and per-child parental control settings.
 * All operations enforce parent ownership — parents can only access their own children.
 */

const Child = require("../models/Child");
const CompletedActivity = require("../models/CompletedActivity");
const AssignedActivity = require("../models/AssignedActivity");
const Reward = require("../models/Reward");
const RewardClaim = require("../models/RewardClaim");
const Badge = require("../models/Badge");
const ParentSettings = require("../models/ParentSettings");
const Notification = require("../models/Notification");

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Verify that a child belongs to the authenticated parent.
 * @param {string} childId - The child's ObjectId.
 * @param {string} parentId - The authenticated parent's ObjectId.
 * @returns {Document|null} Child document or null if not found/unauthorized.
 */
const getOwnedChild = async (childId, parentId) => {
  return Child.findOne({ _id: childId, parentId });
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/parents/dashboard
 * @desc    Get parent dashboard: child summaries, pending approvals, recent activity
 * @access  Private (PARENT)
 */
const getDashboard = async (req, res, next) => {
  try {
    const parentId = req.user._id;

    // Get all active children
    const children = await Child.find({ parentId, active: true }).lean();
    const childIds = children.map((c) => c._id);

    // Pending activity approvals
    const pendingActivities = await CompletedActivity.countDocuments({
      childId: { $in: childIds },
      status: "SUBMITTED",
    });

    // Pending reward claims
    const pendingRewardClaims = await RewardClaim.countDocuments({
      parentId,
      status: "REQUESTED",
    });

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({
      userId: parentId,
      isRead: false,
    });

    // Per-child summary stats
    const childSummaries = await Promise.all(
      children.map(async (child) => {
        const [completedCount, badges, pendingCount] = await Promise.all([
          CompletedActivity.countDocuments({
            childId: child._id,
            status: "APPROVED",
          }),
          Badge.find({ childId: child._id })
            .sort({ earnedAt: -1 })
            .limit(3)
            .lean(),
          CompletedActivity.countDocuments({
            childId: child._id,
            status: "SUBMITTED",
          }),
        ]);

        return {
          ...child,
          completedActivities: completedCount,
          recentBadges: badges,
          pendingApprovals: pendingCount,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: {
        totalChildren: children.length,
        pendingActivities,
        pendingRewardClaims,
        unreadNotifications,
        children: childSummaries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Children CRUD ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/parents/children
 * @desc    Create a new child profile for the authenticated parent
 * @access  Private (PARENT)
 */
const createChild = async (req, res, next) => {
  try {
    const { name, age, avatar, ageGroup } = req.body;
    const parentId = req.user._id;

    const child = await Child.create({
      parentId,
      name,
      age,
      avatar: avatar || "",
      ageGroup,
    });

    // Create default ParentSettings for this child
    await ParentSettings.create({
      parentId,
      childId: child._id,
    });

    // Notify parent
    await Notification.create({
      userId: parentId,
      childId: child._id,
      message: `Child profile for "${name}" has been created successfully!`,
      type: "SUCCESS",
    });

    res.status(201).json({
      success: true,
      message: "Child profile created successfully.",
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/parents/children
 * @desc    Get all active children for the authenticated parent
 * @access  Private (PARENT)
 */
const getChildren = async (req, res, next) => {
  try {
    const children = await Child.find({
      parentId: req.user._id,
      active: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/parents/children/:childId
 * @desc    Get a single child profile (must belong to authenticated parent)
 * @access  Private (PARENT)
 */
const getChild = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Enrich with quick stats
    const [completedCount, badges] = await Promise.all([
      CompletedActivity.countDocuments({
        childId: child._id,
        status: "APPROVED",
      }),
      Badge.find({ childId: child._id }).sort({ earnedAt: -1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...child.toObject(),
        completedActivities: completedCount,
        badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/parents/children/:childId
 * @desc    Update a child profile
 * @access  Private (PARENT)
 */
const updateChild = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    const allowedUpdates = ["name", "age", "avatar", "ageGroup"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        child[field] = req.body[field];
      }
    });

    await child.save();

    res.status(200).json({
      success: true,
      message: "Child profile updated successfully.",
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/parents/children/:childId
 * @desc    Deactivate (soft-delete) a child profile
 * @access  Private (PARENT)
 */
const deactivateChild = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    child.active = false;
    await child.save();

    res.status(200).json({
      success: true,
      message: `Child profile for "${child.name}" has been deactivated.`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Parent Settings ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/parents/settings/:childId
 * @desc    Get parental control settings for a specific child
 * @access  Private (PARENT)
 */
const getSettings = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Find or return default settings
    let settings = await ParentSettings.findOne({
      parentId: req.user._id,
      childId: child._id,
    }).lean();

    if (!settings) {
      // Return defaults without saving
      settings = {
        allowedCategories: [],
        maxDailyActivities: 5,
        maxSessionMinutes: 30,
        requireApprovalForActivities: true,
        requireApprovalForRewards: true,
        physicalActivityRequired: true,
        passiveContentBlocked: true,
      };
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/parents/settings/:childId
 * @desc    Update or create parental control settings for a child
 * @access  Private (PARENT)
 */
const updateSettings = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    const {
      allowedCategories,
      maxDailyActivities,
      maxSessionMinutes,
      requireApprovalForActivities,
      requireApprovalForRewards,
      physicalActivityRequired,
      passiveContentBlocked,
    } = req.body;

    // Upsert settings for this parent-child pair
    const settings = await ParentSettings.findOneAndUpdate(
      { parentId: req.user._id, childId: child._id },
      {
        $set: {
          ...(allowedCategories !== undefined && { allowedCategories }),
          ...(maxDailyActivities !== undefined && { maxDailyActivities }),
          ...(maxSessionMinutes !== undefined && { maxSessionMinutes }),
          ...(requireApprovalForActivities !== undefined && {
            requireApprovalForActivities,
          }),
          ...(requireApprovalForRewards !== undefined && {
            requireApprovalForRewards,
          }),
          ...(physicalActivityRequired !== undefined && {
            physicalActivityRequired,
          }),
          ...(passiveContentBlocked !== undefined && { passiveContentBlocked }),
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Parental settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/parents/reports/:childId
 * @desc    Get a full report for a specific child (delegates to report data aggregation)
 * @access  Private (PARENT)
 */
const getChildReport = async (req, res, next) => {
  try {
    const child = await getOwnedChild(req.params.childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    const childId = child._id;

    // Aggregate comprehensive report data
    const [
      completedActivities,
      assignedActivities,
      badges,
      rewardClaims,
      settings,
    ] = await Promise.all([
      CompletedActivity.find({ childId, status: "APPROVED" })
        .populate(
          "activityId",
          "title category difficulty points durationMinutes",
        )
        .sort({ approvedAt: -1 })
        .limit(50)
        .lean(),
      AssignedActivity.find({ childId })
        .populate("activityId", "title category difficulty")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Badge.find({ childId }).sort({ earnedAt: -1 }).lean(),
      RewardClaim.find({ childId })
        .populate("rewardId", "title pointsRequired rewardType")
        .sort({ createdAt: -1 })
        .lean(),
      ParentSettings.findOne({ parentId: req.user._id, childId }).lean(),
    ]);

    // Calculate total points from completed activities
    const totalPointsEarned = completedActivities.reduce(
      (sum, c) => sum + (c.pointsAwarded || 0),
      0,
    );

    // Category distribution
    const categoryDistribution = completedActivities.reduce((acc, c) => {
      const cat = c.activityId?.category || "UNKNOWN";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        child,
        summary: {
          totalPoints: child.points,
          totalPointsEarned,
          totalCompleted: completedActivities.length,
          totalBadges: badges.length,
          totalRewardsClaimed: rewardClaims.length,
          categoryDistribution,
        },
        completedActivities,
        assignedActivities,
        badges,
        rewardClaims,
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  createChild,
  getChildren,
  getChild,
  updateChild,
  deactivateChild,
  getSettings,
  updateSettings,
  getChildReport,
};
