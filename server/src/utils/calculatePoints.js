/**
 * @file calculatePoints.js
 * @description Utility to calculate points awarded for completed activities
 * based on difficulty multiplier and base activity points.
 */

/** Multipliers applied to base activity points based on difficulty level */
const DIFFICULTY_MULTIPLIERS = {
  EASY: 1.0,
  MEDIUM: 1.5,
  HARD: 2.0,
};

/**
 * Calculates the points to award for completing an activity.
 * @param {number} basePoints - The base points defined on the activity.
 * @param {string} difficulty - The difficulty level: "EASY" | "MEDIUM" | "HARD".
 * @param {number} [bonusPoints=0] - Optional bonus points (e.g., streak bonus).
 * @returns {number} Total points awarded, rounded to nearest integer.
 */
const calculatePoints = (basePoints, difficulty, bonusPoints = 0) => {
  if (typeof basePoints !== "number" || basePoints < 0) {
    throw new Error("basePoints must be a non-negative number.");
  }

  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const calculated = Math.round(basePoints * multiplier + bonusPoints);

  return calculated;
};

/**
 * Calculates a streak bonus based on consecutive days of activity.
 * @param {number} streakDays - Number of consecutive active days.
 * @returns {number} Bonus points for the streak.
 */
const calculateStreakBonus = (streakDays) => {
  if (streakDays >= 7) return 20;
  if (streakDays >= 5) return 10;
  if (streakDays >= 3) return 5;
  return 0;
};

module.exports = { calculatePoints, calculateStreakBonus, DIFFICULTY_MULTIPLIERS };
