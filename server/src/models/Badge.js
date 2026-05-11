/**
 * @file Badge.js
 * @description Mongoose model for achievement badges awarded to children.
 * Badges are earned automatically by the badge engine when criteria are met.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const badgeSchema = new Schema(
  {
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      required: [true, "Child ID is required."],
    },
    name: {
      type: String,
      required: [true, "Badge name is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Badge description is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Badge category is required."],
      trim: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly retrieve all badges for a child
badgeSchema.index({ childId: 1, earnedAt: -1 });

// Ensure a child cannot earn the same badge twice
badgeSchema.index({ childId: 1, name: 1 }, { unique: true });

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;
