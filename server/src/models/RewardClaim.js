/**
 * @file RewardClaim.js
 * @description Mongoose model tracking reward claims made by children.
 * Lifecycle: REQUESTED → APPROVED | REJECTED → COMPLETED
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const rewardClaimSchema = new Schema(
  {
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: "Reward",
      required: [true, "Reward ID is required."],
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      required: [true, "Child ID is required."],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Parent ID is required."],
    },
    status: {
      type: String,
      enum: {
        values: ["REQUESTED", "APPROVED", "REJECTED", "COMPLETED"],
        message: "Invalid claim status.",
      },
      default: "REQUESTED",
    },
    parentNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for parent and child-based claim lookups
rewardClaimSchema.index({ parentId: 1, status: 1 });
rewardClaimSchema.index({ childId: 1 });

const RewardClaim = mongoose.model("RewardClaim", rewardClaimSchema);

module.exports = RewardClaim;
