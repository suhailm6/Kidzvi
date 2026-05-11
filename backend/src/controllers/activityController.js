/**
 * @file activityController.js
 * @description Manages the activity library: listing, creating, updating,
 * assigning to children, and submitting completions.
 */

const Activity = require("../models/Activity");
const AssignedActivity = require("../models/AssignedActivity");
const CompletedActivity = require("../models/CompletedActivity");
const Child = require("../models/Child");
const Notification = require("../models/Notification");

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Verify parent owns the child.
 */
const getOwnedChild = async (childId, parentId) => {
  return Child.findOne({ _id: childId, parentId, active: true });
};

const toClientActivity = (activity) => {
  if (!activity) return activity;
  const data = activity.toObject ? activity.toObject() : activity;
  return { ...data, pointsValue: data.points };
};

const toClientAssignment = (assignment) => {
  const data = assignment.toObject ? assignment.toObject() : assignment;
  const statusMap = {
    SUBMITTED: "PENDING_APPROVAL",
    APPROVED: "COMPLETED",
  };

  return {
    ...data,
    status: statusMap[data.status] || data.status,
    activity: toClientActivity(data.activityId),
  };
};

// ─── Activity Library ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/activities
 * @desc    List all active activities with optional filters
 * @access  Private
 * @query   ageGroup, category, difficulty, isActive
 */
const getActivities = async (req, res, next) => {
  try {
    const { ageGroup, category, difficulty, isActive, search } = req.query;

    const query = {};

    // Admins can see all; parents see only active
    if (req.user.role !== "ADMIN") {
      query.isActive = true;
    } else if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (ageGroup) query.ageGroup = ageGroup;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    // Optional text search on title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const activities = await Activity.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities.map(toClientActivity),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/activities/:id
 * @desc    Get a single activity by ID
 * @access  Private
 */
const getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: toClientActivity(activity),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/activities
 * @desc    Create a new activity (ADMIN or PARENT)
 * @access  Private (ADMIN | PARENT)
 */
const createActivity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      ageGroup,
      difficulty,
      durationMinutes,
      points,
      pointsValue,
      instructions,
      developmentGoal,
      requiresParentApproval,
      requiresParentSupervision,
    } = req.body;

    const activity = await Activity.create({
      title,
      description,
      category,
      ageGroup,
      difficulty: difficulty || "EASY",
      durationMinutes,
      points: points ?? pointsValue,
      instructions: instructions || description,
      developmentGoal: developmentGoal || "General learning and healthy engagement",
      requiresParentApproval: requiresParentApproval !== undefined ? requiresParentApproval : true,
      requiresParentSupervision: requiresParentSupervision !== undefined ? requiresParentSupervision : false,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully.",
      data: toClientActivity(activity),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/activities/:id
 * @desc    Update an activity
 * @access  Private (ADMIN or original creator)
 */
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    // Only admin or the creator can update
    if (
      req.user.role !== "ADMIN" &&
      activity.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this activity.",
      });
    }

    const updatableFields = [
      "title", "description", "category", "ageGroup", "difficulty",
      "durationMinutes", "points", "pointsValue", "instructions", "developmentGoal",
      "requiresParentApproval", "requiresParentSupervision", "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        activity[field === "pointsValue" ? "points" : field] = req.body[field];
      }
    });

    await activity.save();

    res.status(200).json({
      success: true,
      message: "Activity updated successfully.",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/activities/:id
 * @desc    Soft-delete (deactivate) an activity
 * @access  Private (ADMIN or original creator)
 */
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    // Only admin or the creator can delete
    if (
      req.user.role !== "ADMIN" &&
      activity.createdBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this activity.",
      });
    }

    activity.isActive = false;
    await activity.save();

    res.status(200).json({
      success: true,
      message: "Activity has been deactivated.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Assignment ────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/activities/assign
 * @desc    Assign an activity to a child
 * @access  Private (PARENT)
 * @body    { childId, activityId, dueDate? }
 */
const assignActivity = async (req, res, next) => {
  try {
    const { childId, activityId, dueDate } = req.body;
    const parentId = req.user._id;

    // Verify ownership
    const child = await getOwnedChild(childId, parentId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    // Verify activity exists and is active
    const activity = await Activity.findOne({ _id: activityId, isActive: true });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found or is no longer active.",
      });
    }

    // Check age group compatibility
    if (activity.ageGroup !== child.ageGroup) {
      return res.status(400).json({
        success: false,
        message: `This activity is designed for age group ${activity.ageGroup}, but the child is in group ${child.ageGroup}.`,
      });
    }

    // Prevent duplicate active assignment
    const existingAssignment = await AssignedActivity.findOne({
      childId,
      activityId,
      status: { $in: ["ASSIGNED", "SUBMITTED"] },
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "This activity is already assigned to the child and not yet completed.",
      });
    }

    const assigned = await AssignedActivity.create({
      childId,
      activityId,
      assignedBy: parentId,
      dueDate: dueDate || null,
    });

    // Notify parent
    await Notification.create({
      userId: parentId,
      childId,
      message: `Activity "${activity.title}" has been assigned to ${child.name}.`,
      type: "INFO",
    });

    const populated = await assigned.populate([
      { path: "activityId", select: "title category difficulty points durationMinutes" },
      { path: "childId", select: "name ageGroup" },
    ]);

    res.status(201).json({
      success: true,
      message: `Activity "${activity.title}" assigned to ${child.name} successfully.`,
      data: toClientAssignment(populated),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/activities/child/:childId
 * @desc    Get all assigned activities for a specific child
 * @access  Private (PARENT)
 */
const getAssignedActivities = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const parentId = req.user._id;

    // Ownership check
    const child = await getOwnedChild(childId, parentId);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found or you do not have access to this profile.",
      });
    }

    const { status } = req.query;
    const query = { childId };
    if (status) query.status = status;

    const assignments = await AssignedActivity.find(query)
      .populate("activityId", "title description category difficulty durationMinutes points instructions developmentGoal")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments.map(toClientAssignment),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/activities/:assignedActivityId/submit
 * @desc    Mark an assigned activity as submitted (child completed it)
 * @access  Private (PARENT acting on behalf of child)
 * @body    { childNote? }
 */
const submitActivity = async (req, res, next) => {
  try {
    const { assignedActivityId } = req.params;
    const { childNote, note } = req.body;
    const parentId = req.user._id;

    // Find the assigned activity
    const assigned = await AssignedActivity.findById(assignedActivityId).populate(
      "activityId"
    );

    if (!assigned) {
      return res.status(404).json({
        success: false,
        message: "Assigned activity not found.",
      });
    }

    // Ownership check — the child must belong to this parent
    const child = await getOwnedChild(assigned.childId.toString(), parentId);
    if (!child) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit for this child.",
      });
    }

    if (assigned.status !== "ASSIGNED") {
      return res.status(400).json({
        success: false,
        message: `Cannot submit. Activity status is currently "${assigned.status}".`,
      });
    }

    // Update assigned activity status to SUBMITTED
    assigned.status = "SUBMITTED";
    await assigned.save();

    // Create a CompletedActivity submission record
    const completedActivity = await CompletedActivity.create({
      childId: assigned.childId,
      activityId: assigned.activityId._id,
      assignedActivityId: assigned._id,
      childNote: childNote || note || "",
      status: "SUBMITTED",
    });

    // Notify parent that a review is needed
    await Notification.create({
      userId: parentId,
      childId: assigned.childId,
      message: `${child.name} has completed "${assigned.activityId.title}" — awaiting your approval!`,
      type: "ACTION",
    });

    res.status(201).json({
      success: true,
      message: "Activity submitted for parent approval.",
      data: completedActivity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  assignActivity,
  getAssignedActivities,
  submitActivity,
};
