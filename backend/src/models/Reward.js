/**
 * @file Reward.js
 * @description Mongoose model for rewards created by parents.
 * Rewards can be child-specific or general (claimable by any child of the parent).
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const rewardSchema = new Schema(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Parent ID is required."],
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      default: null, // null = available to all parent's children
    },
    title: {
      type: String,
      required: [true, "Reward title is required."],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    pointsRequired: {
      type: Number,
      required: [true, "Points required is required."],
      min: [1, "Points required must be at least 1."],
    },
    rewardType: {
      type: String,
      enum: {
        values: ["FAMILY", "PHYSICAL", "CREATIVE", "TOY", "DIGITAL", "OTHER"],
        message: "Invalid reward type.",
      },
      default: "FAMILY",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for parent-based reward listing
rewardSchema.index({ parentId: 1, isActive: 1 });
rewardSchema.index({ childId: 1 });

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
