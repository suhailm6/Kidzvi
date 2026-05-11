/**
 * @file Notification.js
 * @description Mongoose model for in-app notifications sent to users (parents).
 * Supports INFO, SUCCESS, WARNING, and ACTION notification types.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      default: null, // Optional: link to a specific child
    },
    message: {
      type: String,
      required: [true, "Notification message is required."],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["INFO", "SUCCESS", "WARNING", "ACTION"],
        message: "Notification type must be INFO, SUCCESS, WARNING, or ACTION.",
      },
      required: [true, "Notification type is required."],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient unread notification queries per user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
