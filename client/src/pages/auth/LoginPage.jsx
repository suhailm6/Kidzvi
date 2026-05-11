import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "../../components/common/GoogleSignInButton";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const goToDashboard = (user) => {
    const from = location.state?.from?.pathname;
    if (from && from !== "/login") {
      navigate(from, { replace: true });
    } else if (user?.role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (user?.role === "PARENT") {
      navigate("/parent/dashboard");
    } else if (user?.role === "CHILD") {
      navigate(`/child/${user._id || user.id}/dashboard`);
    } else {
      navigate("/parent/dashboard");
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const user = await login(data);
      goToDashboard(user);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    }
  };

  const handleGoogleLogin = async (credential) => {
    setServerError("");
    try {
      const user = await loginWithGoogle(credential);
      goToDashboard(user);
    } catch (err) {
      setServerError(err.response?.data?.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex">
      {/* Left Panel (decorative) */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center"
        >
          <div className="text-7xl mb-8">🌟</div>
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-lg text-indigo-200 leading-relaxed">
            Sign in to continue managing your children's activities, track
            progress, and approve rewards.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: "🎯", text: "Track Missions" },
              { icon: "🏆", text: "Manage Rewards" },
              { icon: "📊", text: "View Reports" },
              { icon: "⚙️", text: "Set Controls" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🌟</span>
              <span className="text-2xl font-bold text-indigo-600">Kidzvi</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Sign in</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2"
              >
                <span>⚠️</span>
                {serverError}
              </motion.div>
            )}

            <GoogleSignInButton
              onSuccess={handleGoogleLogin}
              onError={setServerError}
            />

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                or sign in with email
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-all"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-all"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Create one free
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
