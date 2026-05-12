import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getChildren } from "../api/parentApi";
import AppIcon from "../components/common/AppIcon";

const navItems = [
  { label: "Dashboard", path: "/parent/dashboard", icon: "home" },
  { label: "Children", path: "/parent/children", icon: "child" },
  { label: "Activities", path: "/parent/activities", icon: "list" },
  { label: "Assign", path: "/parent/assign-activities", icon: "pin" },
  { label: "Approvals", path: "/parent/approvals", icon: "check" },
  { label: "Rewards", path: "/parent/rewards", icon: "gift" },
  { label: "Reward Claims", path: "/parent/reward-claims", icon: "trophy" },
  { label: "Reports", path: "/parent/reports", icon: "chart" },
  { label: "Settings", path: "/parent/settings", icon: "settings" },
];

const SidebarNav = ({
  location,
  childrenList,
  selectedChild,
  setSelectedChild,
  setSidebarOpen,
  user,
  handleLogout,
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
      <span className="w-9 h-9 rounded-2xl bg-white text-indigo-700 flex items-center justify-center">
        <AppIcon name="sparkle" className="w-5 h-5" />
      </span>
      <span className="text-xl font-bold text-white">Kidzvi</span>
    </div>

    {/* Child Selector */}
    {childrenList.length > 0 && (
      <div className="px-4 py-3 border-b border-indigo-800">
        <label className="text-xs text-indigo-300 font-medium mb-1 block">
          Active Child
        </label>
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="w-full bg-indigo-800 text-white text-sm rounded-lg px-3 py-2 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {childrenList.map((child) => (
            <option key={child._id || child.id} value={child._id || child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* Nav Links */}
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/");
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
          >
            <AppIcon name={item.icon} className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>

    {/* User Footer */}
    <div className="px-4 py-4 border-t border-indigo-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() || "P"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-800 hover:bg-red-600 text-indigo-200 hover:text-white text-sm transition-colors"
      >
        <AppIcon name="logout" className="w-4 h-4" />
        Log Out
      </button>
    </div>
  </div>
);

const ParentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");

  useEffect(() => {
    getChildren()
      .then((res) => {
        const kids = res.data.data || res.data.children || res.data || [];
        const arr = Array.isArray(kids) ? kids : [];
        setChildrenList(arr);
        if (arr.length > 0 && !selectedChild) {
          setSelectedChild(arr[0]._id || arr[0].id);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarProps = {
    location,
    childrenList,
    selectedChild,
    setSelectedChild,
    setSidebarOpen,
    user,
    handleLogout,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-indigo-900 flex-col shrink-0">
        <SidebarNav {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar Overlay */}
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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 bg-indigo-900 z-40 lg:hidden flex flex-col"
            >
              <SidebarNav {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 h-16 flex items-center gap-4 shrink-0">
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
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find((i) => location.pathname.startsWith(i.path))
                ?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome, {user?.name?.split(" ")[0]}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "P"}
            </div>
          </div>
        </header>

        {/* Page Content */}
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

export default ParentLayout;
