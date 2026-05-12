import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AppIcon from "../components/common/AppIcon";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "chart" },
  { label: "Activities", path: "/admin/activities", icon: "list" },
  { label: "Users", path: "/admin/users", icon: "users" },
];

const AdminSidebar = ({ location, user, handleLogout, setSidebarOpen }) => (
  <div className="flex flex-col h-full">
    <div className="px-6 py-5 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
          <AppIcon name="shield" className="w-5 h-5" />
        </span>
        <div>
          <p className="text-lg font-bold text-white">Kidzvi</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
          >
            <AppIcon name={item.icon} className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>

    <div className="px-4 py-4 border-t border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors text-left px-2 py-1"
      >
        <span className="inline-flex items-center gap-2">
          <AppIcon name="logout" className="w-4 h-4" />
          Log Out
        </span>
      </button>
    </div>
  </div>
);

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarProps = { location, user, handleLogout, setSidebarOpen };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-gray-800 flex-col shrink-0">
        <AdminSidebar {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-60 bg-gray-800 z-40 lg:hidden flex flex-col"
            >
              <AdminSidebar {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800 flex-1">
            {navItems.find((i) => location.pathname.startsWith(i.path))
              ?.label || "Admin"}
          </h1>
          <span className="text-sm text-gray-500">{user?.name}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
