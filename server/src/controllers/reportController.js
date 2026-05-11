/**
 * @file reportController.js
 * @description Generates analytics and progress reports for children.
 * All endpoints enforce parent ownership — parents can only view their own children.
 */

const Child = require("../models/Child");
const CompletedActivity = require("../models/CompletedActivity");
const AssignedActivity = require("../models/AssignedActivity");
const Badge = require("../models/Badge");
const RewardClaim = require("../models/RewardClaim");

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Verifies parent owns the child and returns the child document.
 */
const getOwnedChild = async (childId, parentId) => {
  return Child.findOne({ _id: childId, parentId });
};

/**
 * Get the start of N days ago.
 * @param {number} days
 * @returns {Date}
 */
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Summary Report ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/reports/child/:childId/summary
 * @desc    Overall summary stats for a child
 * @access  Private (PARENT)
 */
const getSummary = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await getOwnedChild(childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or access denied.",
      });
    }

    const [
      totalCompleted,
      totalApproved,
      totalRejected,
      totalAssigned,
      totalBadges,
      totalClaimsCompleted,
    ] = await Promise.all([
      CompletedActivity.countDocuments({ childId }),
      CompletedActivity.countDocuments({ childId, status: "APPROVED" }),
      CompletedActivity.countDocuments({ childId, status: "REJECTED" }),
      AssignedActivity.countDocuments({ childId }),
      Badge.countDocuments({ childId }),
      RewardClaim.countDocuments({ childId, status: "COMPLETED" }),
    ]);

    // Total points ever earned (from approved completions)
    const pointsAggregation = await CompletedActivity.aggregate([
      { $match: { childId: child._id, status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$pointsAwarded" } } },
    ]);
    const totalPointsEarned = pointsAggregation[0]?.total || 0;

    // Last 7 days activity
    const last7Days = await CompletedActivity.countDocuments({
      childId,
      status: "APPROVED",
      approvedAt: { $gte: daysAgo(7) },
    });

    // Last 30 days activity
    const last30Days = await CompletedActivity.countDocuments({
      childId,
      status: "APPROVED",
      approvedAt: { $gte: daysAgo(30) },
    });

    res.status(200).json({
      success: true,
      data: {
        child: {
          _id: child._id,
          name: child.name,
          age: child.age,
          ageGroup: child.ageGroup,
          currentPoints: child.points,
        },
        summary: {
          totalPointsEarned,
          currentPoints: child.points,
          totalCompleted,
          totalApproved,
          totalRejected,
          totalAssigned,
          pendingSubmissions: totalCompleted - totalApproved - totalRejected,
          totalBadges,
          rewardsRedeemed: totalClaimsCompleted,
          activitiesLast7Days: last7Days,
          activitiesLast30Days: last30Days,
          approvalRate:
            totalCompleted > 0
              ? Math.round((totalApproved / totalCompleted) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Weekly Report ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/reports/child/:childId/weekly
 * @desc    Activity counts grouped by day for the last 7 days
 * @access  Private (PARENT)
 */
const getWeeklyReport = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await getOwnedChild(childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or access denied.",
      });
    }

    const sevenDaysAgo = daysAgo(7);

    // Aggregate completed activities by day of week
    const dailyData = await CompletedActivity.aggregate([
      {
        $match: {
          childId: child._id,
          status: "APPROVED",
          approvedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$approvedAt" },
            month: { $month: "$approvedAt" },
            day: { $dayOfMonth: "$approvedAt" },
          },
          activitiesCompleted: { $sum: 1 },
          pointsEarned: { $sum: "$pointsAwarded" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Build a full 7-day array including days with zero activity
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const found = dailyData.find(
        (entry) =>
          entry._id.year === y &&
          entry._id.month === m &&
          entry._id.day === d
      );

      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        activitiesCompleted: found ? found.activitiesCompleted : 0,
        pointsEarned: found ? found.pointsEarned : 0,
      });
    }

    const weeklyTotals = {
      totalActivities: days.reduce((s, d) => s + d.activitiesCompleted, 0),
      totalPoints: days.reduce((s, d) => s + d.pointsEarned, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        child: { _id: child._id, name: child.name },
        weekly: days,
        totals: weeklyTotals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Category Distribution ─────────────────────────────────────────────────────

/**
 * @route   GET /api/reports/child/:childId/category-distribution
 * @desc    Breakdown of completed activities by category
 * @access  Private (PARENT)
 */
const getCategoryDistribution = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await getOwnedChild(childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or access denied.",
      });
    }

    const distribution = await CompletedActivity.aggregate([
      {
        $match: { childId: child._id, status: "APPROVED" },
      },
      {
        $lookup: {
          from: "activities",
          localField: "activityId",
          foreignField: "_id",
          as: "activity",
        },
      },
      { $unwind: "$activity" },
      {
        $group: {
          _id: "$activity.category",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsAwarded" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalPoints: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Calculate percentages
    const total = distribution.reduce((s, d) => s + d.count, 0);
    const enriched = distribution.map((d) => ({
      ...d,
      percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        child: { _id: child._id, name: child.name },
        totalActivities: total,
        distribution: enriched,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reward History ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/reports/child/:childId/rewards
 * @desc    Full reward claim history for a child
 * @access  Private (PARENT)
 */
const getRewardHistory = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await getOwnedChild(childId, req.user._id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or access denied.",
      });
    }

    const claims = await RewardClaim.find({ childId: child._id })
      .populate("rewardId", "title description pointsRequired rewardType")
      .sort({ createdAt: -1 });

    // Aggregate stats
    const totalPointsSpent = claims
      .filter((c) => ["APPROVED", "COMPLETED"].includes(c.status))
      .reduce((sum, c) => sum + (c.rewardId?.pointsRequired || 0), 0);

    const byStatus = claims.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        child: { _id: child._id, name: child.name, currentPoints: child.points },
        stats: {
          totalClaims: claims.length,
          totalPointsSpent,
          byStatus,
        },
        history: claims,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getWeeklyReport,
  getCategoryDistribution,
  getRewardHistory,
};
