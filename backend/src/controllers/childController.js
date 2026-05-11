/**
 * @file childController.js
 * @description Handles child-facing dashboard data and activity status views.
 * Parents access this to view the child's perspective.
 */

const Child = require("../models/Child");
const AssignedActivity = require("../models/AssignedActivity");
const CompletedActivity = require("../models/CompletedActivity");
const Badge = require("../models/Badge");
const Reward = require("../models/Reward");
const RewardClaim = require("../models/RewardClaim");
const ParentSettings = require("../models/ParentSettings");
const { generateDailyPlan, assignTimeSlots } = require("../utils/dailyPlanGenerator");

/**
 * Helper: Verify that a child belongs to the authenticated parent.
 */
const getOwnedChild = async (childId, parentId) => {
  return Child.findOne({ _id: childId, parentId });
};

/**
 * @route   GET /api/children/:childId/dashboard
 * @desc    Get the child's dashboard: points, assigned activities, badges, daily plan
 * @access  Private (PARENT — viewing child's dashboard)
 */
const getChildDashboard = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    // Ownership check
    const child = await getOwnedChild(childId, parentId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Fetch all dashboard data in parallel
    const [
      assignedActivities,
      recentCompleted,
      badges,
      availableRewards,
      rewardClaims,
      settings,
    ] = await Promise.all([
      // Currently assigned and not yet approved
      AssignedActivity.find({
        childId,
        status: { $in: ["ASSIGNED", "SUBMITTED"] },
      })
        .populate("activityId", "title description category difficulty durationMinutes points instructions")
        .sort({ createdAt: -1 })
        .lean(),

      // Recently approved completed activities
      CompletedActivity.find({ childId, status: "APPROVED" })
        .populate("activityId", "title category difficulty points")
        .sort({ approvedAt: -1 })
        .limit(10)
        .lean(),

      // All badges earned
      Badge.find({ childId }).sort({ earnedAt: -1 }).lean(),

      // Available rewards (child-specific or general parent rewards)
      Reward.find({
        parentId,
        isActive: true,
        $or: [{ childId: child._id }, { childId: null }],
      }).lean(),

      // Pending reward claims
      RewardClaim.find({ childId, status: { $in: ["REQUESTED", "APPROVED"] } })
        .populate("rewardId", "title pointsRequired rewardType")
        .lean(),

      // Parent settings for this child
      ParentSettings.findOne({ parentId, childId }).lean(),
    ]);

    // Generate today's suggested daily plan
    let dailyPlan = [];
    try {
      const rawPlan = await generateDailyPlan(childId, parentId, child.ageGroup);
      dailyPlan = assignTimeSlots(rawPlan);
    } catch {
      dailyPlan = []; // Non-fatal — dashboard still works without daily plan
    }

    // Compile stats
    const totalApproved = await CompletedActivity.countDocuments({
      childId,
      status: "APPROVED",
    });

    const totalPointsSpent = await RewardClaim.aggregate([
      { $match: { childId: child._id, status: { $in: ["APPROVED", "COMPLETED"] } } },
      { $lookup: { from: "rewards", localField: "rewardId", foreignField: "_id", as: "reward" } },
      { $unwind: "$reward" },
      { $group: { _id: null, total: { $sum: "$reward.pointsRequired" } } },
    ]);

    const pointsSpent = totalPointsSpent[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        child: {
          _id: child._id,
          name: child.name,
          age: child.age,
          avatar: child.avatar,
          ageGroup: child.ageGroup,
          points: child.points,
        },
        stats: {
          totalPoints: child.points,
          totalActivitiesCompleted: totalApproved,
          totalBadges: badges.length,
          pointsSpent,
          pendingSubmissions: assignedActivities.filter((a) => a.status === "SUBMITTED").length,
        },
        assignedActivities,
        recentCompleted,
        badges,
        availableRewards: availableRewards.filter(
          (r) => r.pointsRequired <= child.points
        ),
        allRewards: availableRewards,
        pendingRewardClaims: rewardClaims,
        dailyPlan,
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChildDashboard };
