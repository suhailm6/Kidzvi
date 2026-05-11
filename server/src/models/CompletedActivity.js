/**
 * @file CompletedActivity.js
 * @description Mongoose model for activity completion submissions.
 * Tracks child notes, parent feedback, approval status, and points awarded.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const completedActivitySchema = new Schema(
  {
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      required: [true, "Child ID is required."],
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: [true, "Activity ID is required."],
    },
    assignedActivityId: {
      type: Schema.Types.ObjectId,
      ref: "AssignedActivity",
      default: null,
    },
    childNote: {
      type: String,
      default: "",
      trim: true,
    },
    parentFeedback: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["SUBMITTED", "APPROVED", "REJECTED"],
        message: "Status must be SUBMITTED, APPROVED, or REJECTED.",
      },
      default: "SUBMITTED",
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: [0, "Points awarded cannot be negative."],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
completedActivitySchema.index({ childId: 1, status: 1 });
completedActivitySchema.index({ childId: 1, createdAt: -1 });

const CompletedActivity = mongoose.model("CompletedActivity", completedActivitySchema);

module.exports = CompletedActivity;
