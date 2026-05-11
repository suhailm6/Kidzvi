/**
 * @file dailyPlanGenerator.js
 * @description Generates a personalized daily activity plan for a child
 * based on their age group, parent settings, and activity history.
 */

const Activity = require("../models/Activity");
const AssignedActivity = require("../models/AssignedActivity");
const ParentSettings = require("../models/ParentSettings");

/**
 * Generates a daily activity plan for a child.
 * Respects parent settings: allowed categories, max activities,
 * physical activity requirements, and passive content blocks.
 *
 * @param {string} childId - The child's MongoDB ObjectId.
 * @param {string} parentId - The parent's MongoDB ObjectId.
 * @param {string} ageGroup - The child's age group ("3-5" | "6-8" | "9-12").
 * @returns {Array} Array of selected Activity documents for the day.
 */
const generateDailyPlan = async (childId, parentId, ageGroup) => {
  // Load parent settings for this child (or use defaults)
  const settings = await ParentSettings.findOne({ parentId, childId });

  const maxActivities = settings?.maxDailyActivities || 5;
  const allowedCategories = settings?.allowedCategories?.length
    ? settings.allowedCategories
    : [
        "LANGUAGE",
        "MATH_LOGIC",
        "CREATIVITY",
        "MEMORY",
        "EMOTIONAL_INTELLIGENCE",
        "PHYSICAL_ACTIVITY",
        "RESPONSIBILITY",
        "FAMILY_BONDING",
        "GENERAL_LEARNING",
      ];
  const physicalRequired = settings?.physicalActivityRequired ?? true;
  const passiveBlocked = settings?.passiveContentBlocked ?? true;

  // Build query for available activities
  const query = {
    ageGroup,
    isActive: true,
    category: { $in: allowedCategories },
  };

  // Fetch all eligible activities
  const allActivities = await Activity.find(query).lean();

  if (!allActivities.length) return [];

  // Separate physical activities from the rest
  const physicalActivities = allActivities.filter(
    (a) => a.category === "PHYSICAL_ACTIVITY"
  );
  const otherActivities = allActivities.filter(
    (a) => a.category !== "PHYSICAL_ACTIVITY"
  );

  const plan = [];

  // Ensure at least one physical activity if required
  if (physicalRequired && physicalActivities.length > 0) {
    const picked = physicalActivities[
      Math.floor(Math.random() * physicalActivities.length)
    ];
    plan.push(picked);
  }

  // Shuffle the remaining activities for variety
  const shuffled = shuffleArray([...otherActivities]);

  // Fill up to maxActivities limit
  for (const activity of shuffled) {
    if (plan.length >= maxActivities) break;
    // Avoid duplicating the physical activity if already added
    if (!plan.find((p) => p._id.toString() === activity._id.toString())) {
      plan.push(activity);
    }
  }

  // Ensure we don't exceed the daily limit
  return plan.slice(0, maxActivities);
};

/**
 * Fisher-Yates shuffle algorithm for randomizing activity order.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} New shuffled array.
 */
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Distributes activities across the day in recommended time slots.
 * @param {Array} activities - The daily plan activities.
 * @returns {Array} Activities enriched with a recommended time slot label.
 */
const assignTimeSlots = (activities) => {
  const slots = ["Morning", "Mid-Morning", "Afternoon", "Late Afternoon", "Evening"];
  return activities.map((activity, index) => ({
    ...activity,
    recommendedSlot: slots[index % slots.length],
  }));
};

module.exports = { generateDailyPlan, assignTimeSlots, shuffleArray };
