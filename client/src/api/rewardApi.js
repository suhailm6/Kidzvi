/**
 * @file rewardApi.js
 * @description API functions for reward management and claim lifecycle.
 * All paths and HTTP methods match backend routes exactly.
 */
import api from "./axiosConfig";

// ─── Rewards CRUD ──────────────────────────────────────────────────────────────

/** Create a new reward */
export const createReward = (data) => api.post("/rewards", data);

/** Get rewards for a specific child */
export const getRewards = (childId) => api.get(`/rewards/${childId}`);

/** Update an existing reward */
export const updateReward = (id, data) => api.put(`/rewards/${id}`, data);

/** Deactivate (soft-delete) a reward */
export const deleteReward = (id) => api.delete(`/rewards/${id}`);

// ─── Reward Claims ─────────────────────────────────────────────────────────────

/** Child claims a reward (spends points) */
export const claimReward = (rewardId, data) =>
  api.post(`/rewards/${rewardId}/claim`, data);

/** Get all pending reward claims for the parent's children */
export const getPendingClaims = () => api.get("/rewards/claims/pending");

/** Parent approves a reward claim */
export const approveRewardClaim = (claimId) =>
  api.put(`/rewards/claims/${claimId}/approve`);

/** Parent rejects a reward claim with optional note */
export const rejectRewardClaim = (claimId, data) =>
  api.put(`/rewards/claims/${claimId}/reject`, data);

/** Parent marks a reward claim as fulfilled/completed */
export const completeRewardClaim = (claimId) =>
  api.put(`/rewards/claims/${claimId}/complete`);
