import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "PARENT") return "/parent/dashboard";
    return "/login";
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="text-xl font-bold text-indigo-600">Kidzvi</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 pb-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-gray-600 hover:text-indigo-600"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="text-center bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-center text-sm text-gray-700 py-2"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-center bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
