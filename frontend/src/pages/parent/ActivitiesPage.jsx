import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getActivities } from "../../api/activityApi";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CATEGORIES, AGE_GROUPS, DIFFICULTIES } from "../../utils/constants";
import {
  getCategoryIcon,
  getDifficultyIcon,
  truncate,
} from "../../utils/helpers";

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    ageGroup: "",
    difficulty: "",
    search: "",
  });

  useEffect(() => {
    let cancelled = false;
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.ageGroup) params.ageGroup = filters.ageGroup;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    setLoading(true);
    getActivities(params)
      .then((res) => {
        if (!cancelled) {
          const data = res.data.data || res.data.activities || res.data || [];
          setActivities(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters.category, filters.ageGroup, filters.difficulty]);

  const filtered = activities.filter(
    (a) =>
      !filters.search ||
      a.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.description?.toLowerCase().includes(filters.search.toLowerCase()),
  );

  const setFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === val ? "" : val }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse and assign activities to your children
          </p>
        </div>
        <Link
          to="/parent/assign-activities"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Assign Activity
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search activities..."
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter("category", cat)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    filters.category === cat
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  <span>{getCategoryIcon(cat)}</span>
                  {cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-8">
            {/* Age Group */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Age Group
              </p>
              <div className="flex gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag}
                    onClick={() => setFilter("ageGroup", ag)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      filters.ageGroup === ag
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {ag} yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Difficulty
              </p>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilter("difficulty", d)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      filters.difficulty === d
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <span>{getDifficultyIcon(d)}</span>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(filters.category || filters.ageGroup || filters.difficulty) && (
            <button
              onClick={() =>
                setFilters({
                  category: "",
                  ageGroup: "",
                  difficulty: "",
                  search: "",
                })
              }
              className="text-xs text-red-500 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${filtered.length} activities found`}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-semibold text-gray-400 mb-4">No matching activities</p>
          <p className="text-gray-500 font-medium">
            No activities match your filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                category: "",
                ageGroup: "",
                difficulty: "",
                search: "",
              })
            }
            className="mt-3 text-indigo-600 text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((activity, i) => (
            <motion.div
              key={activity._id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">
                  {getCategoryIcon(activity.category)}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    category={activity.category}
                    label={activity.category?.replace(/_/g, " ")}
                  />
                  <span className="text-xs text-gray-400">
                    {getDifficultyIcon(activity.difficulty)}{" "}
                    {activity.difficulty}
                  </span>
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-500 flex-1 leading-relaxed">
                {truncate(activity.description, 80)}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{activity.pointsValue} pts</span>
                  <span>{activity.durationMinutes} min</span>
                  <span>Age {activity.ageGroup}</span>
                </div>
                <Link
                  to="/parent/assign-activities"
                  state={{ activityId: activity._id }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Assign →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
