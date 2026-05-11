import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const ChildLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { childId } = useParams();

  const navItems = [
    { label: "🏠 Home", path: `/child/${childId}/dashboard` },
    { label: "🎯 Missions", path: `/child/${childId}/missions` },
    { label: "🎁 Rewards", path: `/child/${childId}/rewards` },
    { label: "🏅 Badges", path: `/child/${childId}/badges` },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Back */}
          <div className="flex items-center gap-3">
            <Link to={`/child/${childId}/dashboard`} className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🌟</span>
              <span className="hidden sm:block">Kidzvi</span>
            </Link>
          </div>

          {/* Points Display */}
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <span className="text-yellow-300 text-xl">⭐</span>
            <span className="text-white font-bold text-lg">
              {user?.points ?? 0}
            </span>
            <span className="text-white/80 text-sm hidden sm:block">points</span>
          </div>

          {/* Child Name + Logout */}
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold hidden sm:block">
              Hi, {user?.name?.split(" ")[0] || "Friend"}! 👋
            </span>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all
                    ${
                      isActive
                        ? "bg-yellow-50 text-purple-700 shadow-md"
                        : "text-white/80 hover:text-white hover:bg-white/20"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs">
        Kidzvi — Keep going, you're doing great! 🚀
      </footer>
    </div>
  );
};

export default ChildLayout;
