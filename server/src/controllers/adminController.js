/**
 * @file adminController.js
 * @description Admin-only operations: user management, activity administration,
 * platform-wide analytics, and database seeding.
 */

const User = require("../models/User");
const Child = require("../models/Child");
const Activity = require("../models/Activity");
const CompletedActivity = require("../models/CompletedActivity");
const AssignedActivity = require("../models/AssignedActivity");
const RewardClaim = require("../models/RewardClaim");
const Badge = require("../models/Badge");

// ─── Seed Data ─────────────────────────────────────────────────────────────────

/**
 * Sample activities to seed the platform with initial content.
 * Covers language, creativity, physical, and responsibility categories.
 */
const SEED_ACTIVITIES = [
  {
    title: "Read a Short Story",
    description:
      "Choose a short picture book or story from your shelf. Read it quietly or out loud. After reading, tell an adult what happened in the story.",
    category: "LANGUAGE",
    ageGroup: "6-8",
    difficulty: "EASY",
    durationMinutes: 15,
    points: 10,
    instructions:
      "1. Pick a book that interests you.\n2. Find a quiet place to sit.\n3. Read the whole story from beginning to end.\n4. Tell a parent or guardian: Who were the main characters? What happened? Did you like the ending?",
    developmentGoal:
      "Builds reading comprehension, vocabulary, and verbal communication skills.",
    requiresParentApproval: true,
    requiresParentSupervision: false,
    isActive: true,
  },
  {
    title: "Draw Your Dream Animal",
    description:
      "Imagine a brand-new animal that doesn't exist yet! Draw it, colour it, and give it a name. Be as creative as you like — it can have wings, spots, multiple tails, anything!",
    category: "CREATIVITY",
    ageGroup: "6-8",
    difficulty: "EASY",
    durationMinutes: 20,
    points: 10,
    instructions:
      "1. Get paper and your drawing/colouring tools.\n2. Close your eyes and imagine a magical new animal.\n3. Draw it as detailed as you can.\n4. Colour it using any colours you like.\n5. Write its name and one fun fact about it at the bottom of the page.",
    developmentGoal:
      "Encourages imaginative thinking, fine motor skills, and creative expression.",
    requiresParentApproval: true,
    requiresParentSupervision: false,
    isActive: true,
  },
  {
    title: "20 Jumping Jacks",
    description:
      "Get your body moving with 20 jumping jacks! This quick exercise gets your heart pumping and energy levels up.",
    category: "PHYSICAL_ACTIVITY",
    ageGroup: "6-8",
    difficulty: "EASY",
    durationMinutes: 5,
    points: 5,
    instructions:
      "1. Stand up straight with your feet together and arms at your sides.\n2. Jump and spread your feet shoulder-width apart while raising your arms above your head.\n3. Jump back to starting position.\n4. Repeat 20 times.\n5. Rest for 30 seconds when done.\n6. Tell your parent you've completed your jumping jacks!",
    developmentGoal:
      "Promotes physical fitness, gross motor coordination, and healthy habits.",
    requiresParentApproval: true,
    requiresParentSupervision: false,
    isActive: true,
  },
  {
    title: "Clean Your Study Table",
    description:
      "A clean workspace helps you focus! Tidy up your study table by organising your books, pencils, and any other items.",
    category: "RESPONSIBILITY",
    ageGroup: "6-8",
    difficulty: "EASY",
    durationMinutes: 10,
    points: 8,
    instructions:
      "1. Remove everything from your table.\n2. Wipe the surface clean with a cloth.\n3. Sort your books neatly.\n4. Put pencils and pens in their holder.\n5. Place any other items in their proper spots.\n6. Step back and admire your tidy space!\n7. Let your parent come and check.",
    developmentGoal:
      "Develops responsibility, organisational skills, and a sense of ownership over personal space.",
    requiresParentApproval: true,
    requiresParentSupervision: false,
    isActive: true,
  },
];

// ─── User Management ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users with basic stats
 * @access  Private (ADMIN)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    // Enrich with child count for PARENT users
    const enriched = await Promise.all(
      users.map(async (user) => {
        if (user.role === "PARENT") {
          const childCount = await Child.countDocuments({ parentId: user._id });
          return { ...user, childCount };
        }
        return user;
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Activity Administration ───────────────────────────────────────────────────

/**
 * @route   GET /api/admin/activities
 * @desc    Get all activities (including inactive)
 * @access  Private (ADMIN)
 */
const getAllActivities = async (req, res, next) => {
  try {
    const { ageGroup, category, isActive, difficulty } = req.query;

    const query = {};
    if (ageGroup) query.ageGroup = ageGroup;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const activities = await Activity.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/activities
 * @desc    Create a new activity (admin-sourced)
 * @access  Private (ADMIN)
 */
const createActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully.",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/activities/:id
 * @desc    Update any activity
 * @access  Private (ADMIN)
 */
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity updated successfully.",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/activities/:id
 * @desc    Hard-delete or deactivate an activity
 * @access  Private (ADMIN)
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { hard } = req.query; // ?hard=true for permanent deletion

    if (hard === "true") {
      await Activity.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Activity permanently deleted.",
      });
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Activity deactivated.",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Platform Reports ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/admin/reports
 * @desc    Platform-wide statistics for the admin dashboard
 * @access  Private (ADMIN)
 */
const getPlatformReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalParents,
      totalChildren,
      totalActivities,
      totalActiveActivities,
      totalCompletions,
      totalApprovedCompletions,
      totalBadges,
      totalRewardClaims,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "PARENT" }),
      Child.countDocuments({ active: true }),
      Activity.countDocuments(),
      Activity.countDocuments({ isActive: true }),
      CompletedActivity.countDocuments(),
      CompletedActivity.countDocuments({ status: "APPROVED" }),
      Badge.countDocuments(),
      RewardClaim.countDocuments(),
    ]);

    // Category breakdown across all completed activities
    const categoryBreakdown = await CompletedActivity.aggregate([
      { $match: { status: "APPROVED" } },
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
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top active children by points
    const topChildren = await Child.find({ active: true })
      .sort({ points: -1 })
      .limit(10)
      .select("name age ageGroup points parentId")
      .populate("parentId", "name email")
      .lean();

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        platform: {
          totalUsers,
          totalParents,
          totalAdmins: totalUsers - totalParents,
          recentRegistrations,
          totalChildren,
          totalActivities,
          totalActiveActivities,
        },
        engagement: {
          totalCompletions,
          totalApprovedCompletions,
          approvalRate:
            totalCompletions > 0
              ? Math.round((totalApprovedCompletions / totalCompletions) * 100)
              : 0,
          totalBadges,
          totalRewardClaims,
        },
        categoryBreakdown,
        topChildren,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Database Seeding ──────────────────────────────────────────────────────────

/**
 * @route   POST /api/admin/seed/activities
 * @desc    Seed the database with the 4 sample activities
 * @access  Private (ADMIN)
 */
const seedActivities = async (req, res, next) => {
  try {
    const results = {
      created: [],
      skipped: [],
    };

    for (const activityData of SEED_ACTIVITIES) {
      const exists = await Activity.findOne({ title: activityData.title });
      if (exists) {
        results.skipped.push(activityData.title);
        continue;
      }

      const created = await Activity.create({
        ...activityData,
        createdBy: req.user._id,
      });
      results.created.push(created.title);
    }

    res.status(200).json({
      success: true,
      message: `Seeding complete. ${results.created.length} activities created, ${results.skipped.length} already existed.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getPlatformReports,
  seedActivities,
};
