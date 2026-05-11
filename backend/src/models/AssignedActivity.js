/**
 * @file AssignedActivity.js
 * @description Mongoose model tracking activities assigned to children by parents.
 * Lifecycle: ASSIGNED → SUBMITTED → APPROVED | REJECTED
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const assignedActivitySchema = new Schema(
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
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by (parent) ID is required."],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["ASSIGNED", "SUBMITTED", "APPROVED", "REJECTED"],
        message: "Invalid status value.",
      },
      default: "ASSIGNED",
    },
  },
  {
    timestamps: true,
  }
);

// Index for child-based lookups and status filtering
assignedActivitySchema.index({ childId: 1, status: 1 });
assignedActivitySchema.index({ assignedBy: 1 });

const AssignedActivity = mongoose.model("AssignedActivity", assignedActivitySchema);

module.exports = AssignedActivity;
