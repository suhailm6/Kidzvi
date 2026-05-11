/**
 * @file reportApi.js
 * @description API functions for child progress reports and analytics.
 * All paths match backend /api/reports routes exactly.
 */
import api from "./axiosConfig";

/** Get overall summary stats for a child */
export const getSummary = (childId) =>
  api.get(`/reports/child/${childId}/summary`);

/** Get last 7 days activity data for a child */
export const getWeekly = (childId) =>
  api.get(`/reports/child/${childId}/weekly`);

/** Get category distribution breakdown for a child */
export const getCategoryDistribution = (childId) =>
  api.get(`/reports/child/${childId}/category-distribution`);

/** Get reward claim history for a child */
export const getRewardHistory = (childId) =>
  api.get(`/reports/child/${childId}/rewards`);
