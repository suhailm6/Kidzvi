/**
 * @file badgeEngine.js
 * @description Engine to evaluate badge criteria and award badges to children
 * based on their completed activities, points, and behavioral streaks.
 */

const Badge = require("../models/Badge");
const CompletedActivity = require("../models/CompletedActivity");

/**
 * Badge definitions with their criteria functions.
 * Each badge has a name, description, category, and a check function.
 */
const BADGE_DEFINITIONS = [
  {
    name: "First Step",
    description: "Completed your very first activity!",
    category: "MILESTONE",
    check: async (childId, stats) => stats.totalCompleted >= 1,
  },
  {
    name: "Activity Explorer",
    description: "Completed 5 activities. Keep it up!",
    category: "MILESTONE",
    check: async (childId, stats) => stats.totalCompleted >= 5,
  },
  {
    name: "Super Achiever",
    description: "Completed 20 activities. You are amazing!",
    category: "MILESTONE",
    check: async (childId, stats) => stats.totalCompleted >= 20,
  },
  {
    name: "Point Collector",
    description: "Earned 100 points total!",
    category: "POINTS",
    check: async (childId, stats) => stats.totalPoints >= 100,
  },
  {
    name: "Point Master",
    description: "Earned 500 points total!",
    category: "POINTS",
    check: async (childId, stats) => stats.totalPoints >= 500,
  },
  {
    name: "Bookworm",
    description: "Completed 3 Language activities!",
    category: "LANGUAGE",
    check: async (childId, stats) => (stats.categoryCounts["LANGUAGE"] || 0) >= 3,
  },
  {
    name: "Math Wizard",
    description: "Completed 3 Math & Logic activities!",
    category: "MATH_LOGIC",
    check: async (childId, stats) => (stats.categoryCounts["MATH_LOGIC"] || 0) >= 3,
  },
  {
    name: "Creative Star",
    description: "Completed 3 Creativity activities!",
    category: "CREATIVITY",
    check: async (childId, stats) => (stats.categoryCounts["CREATIVITY"] || 0) >= 3,
  },
  {
    name: "Fitness Champion",
    description: "Completed 3 Physical Activity tasks!",
    category: "PHYSICAL_ACTIVITY",
    check: async (childId, stats) => (stats.categoryCounts["PHYSICAL_ACTIVITY"] || 0) >= 3,
  },
  {
    name: "Responsibility Hero",
    description: "Completed 3 Responsibility activities!",
    category: "RESPONSIBILITY",
    check: async (childId, stats) => (stats.categoryCounts["RESPONSIBILITY"] || 0) >= 3,
  },
  {
    name: "Hard Worker",
    description: "Completed a HARD difficulty activity!",
    category: "DIFFICULTY",
    check: async (childId, stats) => stats.hardCompleted >= 1,
  },
];

/**
 * Gathers statistics for a child needed for badge evaluation.
 * @param {string} childId - The child's MongoDB ObjectId.
 * @returns {Object} Stats including totalCompleted, totalPoints, categoryCounts, hardCompleted.
 */
const gatherChildStats = async (childId) => {
  const completed = await CompletedActivity.find({
    childId,
    status: "APPROVED",
  }).populate("activityId", "category difficulty points");

  const totalCompleted = completed.length;
  const totalPoints = completed.reduce((sum, c) => sum + (c.pointsAwarded || 0), 0);

  const categoryCounts = {};
  let hardCompleted = 0;

  for (const c of completed) {
    if (c.activityId) {
      const cat = c.activityId.category;
      const diff = c.activityId.difficulty;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (diff === "HARD") hardCompleted++;
    }
  }

  return { totalCompleted, totalPoints, categoryCounts, hardCompleted };
};

/**
 * Checks and awards any new badges earned by a child.
 * Skips badges that the child already has.
 * @param {string} childId - The child's MongoDB ObjectId.
 * @returns {Array} Array of newly awarded badge documents.
 */
const checkAndAwardBadges = async (childId) => {
  const stats = await gatherChildStats(childId);

  // Get already-earned badge names to avoid duplicates
  const existingBadges = await Badge.find({ childId }, { name: 1 });
  const earnedNames = new Set(existingBadges.map((b) => b.name));

  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedNames.has(def.name)) continue;

    const qualifies = await def.check(childId, stats);
    if (qualifies) {
      const badge = await Badge.create({
        childId,
        name: def.name,
        description: def.description,
        category: def.category,
        earnedAt: new Date(),
      });
      newBadges.push(badge);
    }
  }

  return newBadges;
};

module.exports = { checkAndAwardBadges, BADGE_DEFINITIONS };
