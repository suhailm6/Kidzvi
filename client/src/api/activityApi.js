/**
 * @file activityApi.js
 * @description API functions for activity library, assignment, submission,
 * and parent approval. All paths match backend routes exactly.
 */
import api from "./axiosConfig";

// ─── Activity Library ──────────────────────────────────────────────────────────

/** Get all activities, optionally filtered by ageGroup, category, difficulty */
export const getActivities = (params) => api.get("/activities", { params });

/** Get a single activity by ID */
export const getActivity = (id) => api.get(`/activities/${id}`);

/** Create a new activity (admin or parent) */
export const createActivity = (data) => api.post("/activities", data);

/** Update an activity */
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);

/** Soft-delete (deactivate) an activity */
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// ─── Assignment & Submission ───────────────────────────────────────────────────

/** Assign an activity to a child */
export const assignActivity = (data) => api.post("/activities/assign", data);

/** Get all assigned activities for a specific child */
export const getChildActivities = (childId) =>
  api.get(`/activities/child/${childId}`);

/** Child submits a completed activity (with optional note) */
export const submitActivity = (assignedActivityId, data) =>
  api.post(`/activities/${assignedActivityId}/submit`, data);

// ─── Parent Approvals ──────────────────────────────────────────────────────────
// Note: These use the /approvals route, not /activities

/** Get all pending activity submissions awaiting parent approval */
export const getPendingApprovals = () => api.get("/approvals/pending");

/** Approve a completed activity and award points */
export const approveActivity = (completedActivityId, data) =>
  api.put(`/approvals/activity/${completedActivityId}/approve`, data);

/** Reject a completed activity with feedback */
export const rejectActivity = (completedActivityId, data) =>
  api.put(`/approvals/activity/${completedActivityId}/reject`, data);
