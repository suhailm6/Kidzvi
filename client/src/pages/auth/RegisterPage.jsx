import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import * as authApi from "../../api/authApi";
import GoogleSignInButton from "../../components/common/GoogleSignInButton";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const user = await login({ email: data.email, password: data.password });
      if (user?.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/parent/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  const handleGoogleLogin = async (credential) => {
    setServerError("");
    try {
      const user = await loginWithGoogle(credential);
      if (user?.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/parent/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 text-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md text-center"
        >
          <div className="text-7xl mb-8">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Join Kidzvi Today!</h1>
          <p className="text-lg text-purple-200 leading-relaxed mb-10">
            Start your family's journey toward meaningful activities and healthy
            habits.
          </p>
          <div className="space-y-4 text-left">
            {[
              "✅ Free to get started",
              "✅ Add unlimited children",
              "✅ 100+ curated activities",
              "✅ Full parental control",
              "✅ Beautiful reward system",
            ].map((item) => (
              <p key={item} className="text-purple-100 font-medium">
                {item}
              </p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-3xl">🌟</span>
              <span className="text-2xl font-bold text-indigo-600">Kidzvi</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Create your account
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Get started in under 2 minutes — no credit card required
              </p>
            </div>

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2"
              >
                <span>⚠️</span>
                {serverError}
              </motion.div>
            )}

            <GoogleSignInButton
              onSuccess={handleGoogleLogin}
              onError={setServerError}
              text="signup_with"
            />

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                or create with email
                <span className="h-px flex-1 bg-gray-200" />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-all"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email.message}
                  </p>
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
                {errors.password ? (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    At least 8 chars, one uppercase, one number
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-all"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create account →"
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <div className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
