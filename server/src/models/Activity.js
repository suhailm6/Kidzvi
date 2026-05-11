/**
 * @file Activity.js
 * @description Mongoose model for activities that can be assigned to children.
 * Activities are categorized by type, age group, and difficulty level.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Activity title is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Activity description is required."],
    },
    category: {
      type: String,
      enum: {
        values: [
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
        message: "Invalid activity category.",
      },
      required: [true, "Category is required."],
    },
    ageGroup: {
      type: String,
      enum: {
        values: ["3-5", "6-8", "9-12"],
        message: "Age group must be one of: 3-5, 6-8, 9-12.",
      },
      required: [true, "Age group is required."],
    },
    difficulty: {
      type: String,
      enum: {
        values: ["EASY", "MEDIUM", "HARD"],
        message: "Difficulty must be EASY, MEDIUM, or HARD.",
      },
      default: "EASY",
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration in minutes is required."],
      min: [1, "Duration must be at least 1 minute."],
    },
    points: {
      type: Number,
      required: [true, "Base points value is required."],
      min: [0, "Points cannot be negative."],
    },
    instructions: {
      type: String,
      required: [true, "Instructions are required."],
    },
    developmentGoal: {
      type: String,
      required: [true, "Development goal is required."],
    },
    requiresParentApproval: {
      type: Boolean,
      default: true,
    },
    requiresParentSupervision: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtered listing queries
activitySchema.index({ ageGroup: 1, category: 1, isActive: 1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
