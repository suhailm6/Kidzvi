/**
 * @file ParentSettings.js
 * @description Mongoose model for per-child parental control settings.
 * Controls categories, daily limits, approval requirements, and content rules.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const parentSettingsSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Parent ID is required."],
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      required: [true, "Child ID is required."],
    },
    /** Allowed activity categories. Empty means all categories are allowed. */
    allowedCategories: [
      {
        type: String,
        enum: [
          "LANGUAGE",
          "MATH_LOGIC",
          "CREATIVITY",
          "MEMORY",
          "EMOTIONAL_INTELLIGENCE",
          "PHYSICAL_ACTIVITY",
          "RESPONSIBILITY",
          "FAMILY_BONDING",
          "GENERAL_LEARNING",
        ],
      },
    ],
    /** Maximum number of activities allowed per day */
    maxDailyActivities: {
      type: Number,
      default: 5,
      min: [1, "Max daily activities must be at least 1."],
      max: [20, "Max daily activities cannot exceed 20."],
    },
    /** Maximum total screen/session time in minutes */
    maxSessionMinutes: {
      type: Number,
      default: 30,
      min: [5, "Max session minutes must be at least 5."],
    },
    /** Require parent approval before activity is counted as complete */
    requireApprovalForActivities: {
      type: Boolean,
      default: true,
    },
    /** Require parent approval before reward can be redeemed */
    requireApprovalForRewards: {
      type: Boolean,
      default: true,
    },
    /** Ensure at least one physical activity per day in the daily plan */
    physicalActivityRequired: {
      type: Boolean,
      default: true,
    },
    /** Block passive content (videos, passive reading) from daily plan */
    passiveContentBlocked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one settings document per parent-child pair
parentSettingsSchema.index({ parentId: 1, childId: 1 }, { unique: true });

const ParentSettings = mongoose.model("ParentSettings", parentSettingsSchema);

module.exports = ParentSettings;
