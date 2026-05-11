import { CATEGORY_COLORS } from "../../utils/constants";
import { getCategoryColorClasses } from "../../utils/helpers";

const sizeMap = {
  xs: "text-xs px-2 py-0.5",
  sm: "text-xs px-2.5 py-1",
  md: "text-sm px-3 py-1",
};

const Badge = ({ label, color, category, size = "sm", className = "" }) => {
  let colorClass = "bg-gray-100 text-gray-700";

  if (category) {
    const col = CATEGORY_COLORS[category] || "gray";
    colorClass = getCategoryColorClasses(col);
  } else if (color) {
    colorClass = getCategoryColorClasses(color);
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeMap[size]} ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;
