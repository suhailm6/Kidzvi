import { motion } from "framer-motion";

const colorMap = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  green: "bg-green-50 text-green-600 ring-green-100",
  yellow: "bg-yellow-50 text-yellow-600 ring-yellow-100",
  red: "bg-red-50 text-red-600 ring-red-100",
  purple: "bg-purple-50 text-purple-600 ring-purple-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
};

const StatCard = ({
  icon,
  value,
  label,
  sub,
  color = "indigo",
  trend,
  delay = 0,
}) => {
  const colorClasses = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl ring-1 ${colorClasses}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value ?? "—"}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <p
            className={`text-xs mt-1 font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last week
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
