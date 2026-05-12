import { motion } from "framer-motion";
import AppIcon from "./AppIcon";

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
      className="bg-white/90 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/60 p-6 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className={`p-3 rounded-2xl ring-1 ${colorClasses}`}>
        <AppIcon name={icon} className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">{value ?? "—"}</p>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
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
