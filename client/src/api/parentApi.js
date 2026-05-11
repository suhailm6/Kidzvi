/**
 * @file parentApi.js
 * @description API functions for all parent-facing operations.
 * All paths match backend /api/parents routes exactly.
 */
import api from "./axiosConfig";

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboard = () => api.get("/parents/dashboard");

// ─── Children CRUD ─────────────────────────────────────────────────────────────

export const getChildren = () => api.get("/parents/children");

export const getChild = (childId) => api.get(`/parents/children/${childId}`);

export const createChild = (data) => api.post("/parents/children", data);

export const updateChild = (childId, data) =>
  api.put(`/parents/children/${childId}`, data);

export const deleteChild = (childId) =>
  api.delete(`/parents/children/${childId}`);

// ─── Reports ───────────────────────────────────────────────────────────────────

export const getChildReport = (childId) =>
  api.get(`/parents/reports/${childId}`);

// ─── Parental Control Settings ─────────────────────────────────────────────

/** Get parental control settings for a child */
export const getSettings = (childId) => api.get(`/parents/settings/${childId}`);

/** Update parental control settings for a child */
export const updateSettings = (childId, data) =>
  api.put(`/parents/settings/${childId}`, data);
