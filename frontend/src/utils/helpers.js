export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getAgeGroup = (age) => {
  if (age <= 5) return "3-5";
  if (age <= 8) return "6-8";
  return "9-12";
};

export const getCategoryIcon = (category) => {
  const labels = {
    LANGUAGE: "LA",
    MATH_LOGIC: "ML",
    CREATIVITY: "CR",
    MEMORY: "ME",
    EMOTIONAL_INTELLIGENCE: "EI",
    PHYSICAL_ACTIVITY: "PA",
    RESPONSIBILITY: "RE",
    FAMILY_BONDING: "FB",
    GENERAL_LEARNING: "GL",
  };
  return labels[category] || "AC";
};

export const getDifficultyIcon = (difficulty) => {
  const labels = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  return labels[difficulty] || "Level";
};

export const getPointsColor = (points) => {
  if (points >= 100) return "text-yellow-500";
  if (points >= 50) return "text-indigo-500";
  if (points >= 20) return "text-green-500";
  return "text-gray-500";
};

export const getCategoryColorClasses = (color) => {
  const map = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    teal: "bg-teal-100 text-teal-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return map[color] || "bg-gray-100 text-gray-700";
};

export const truncate = (str, length = 60) => {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "..." : str;
};
