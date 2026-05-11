import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ParentLayout from "../layouts/ParentLayout";
import ChildLayout from "../layouts/ChildLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public Pages
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

// Parent Pages
const ParentDashboard = lazy(() => import("../pages/parent/ParentDashboard"));
const ChildrenList = lazy(() => import("../pages/parent/ChildrenList"));
const ChildProfile = lazy(() => import("../pages/parent/ChildProfile"));
const ActivitiesPage = lazy(() => import("../pages/parent/ActivitiesPage"));
const AssignActivities = lazy(() => import("../pages/parent/AssignActivities"));
const ApprovalsPage = lazy(() => import("../pages/parent/ApprovalsPage"));
const RewardsPage = lazy(() => import("../pages/parent/RewardsPage"));
const RewardClaims = lazy(() => import("../pages/parent/RewardClaims"));
const ReportsPage = lazy(() => import("../pages/parent/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/parent/SettingsPage"));

// Child Pages
const ChildDashboard = lazy(() => import("../pages/child/ChildDashboard"));
const ChildMissions = lazy(() => import("../pages/child/ChildMissions"));
const ChildRewards = lazy(() => import("../pages/child/ChildRewards"));
const ChildBadges = lazy(() => import("../pages/child/ChildBadges"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminActivities = lazy(() => import("../pages/admin/AdminActivities"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));

const SuspenseFallback = () => <LoadingSpinner fullPage text="Loading page..." />;

const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Parent Routes */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ParentDashboard />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/children"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ChildrenList />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/children/:childId"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ChildProfile />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/activities"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ActivitiesPage />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/assign-activities"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <AssignActivities />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/approvals"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ApprovalsPage />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/rewards"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <RewardsPage />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/reward-claims"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <RewardClaims />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/reports"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <ReportsPage />
              </ParentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <ParentLayout>
                <SettingsPage />
              </ParentLayout>
            </ProtectedRoute>
          }
        />

        {/* Child Routes */}
        <Route
          path="/child/:childId/dashboard"
          element={
            <ProtectedRoute>
              <ChildLayout>
                <ChildDashboard />
              </ChildLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/child/:childId/missions"
          element={
            <ProtectedRoute>
              <ChildLayout>
                <ChildMissions />
              </ChildLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/child/:childId/rewards"
          element={
            <ProtectedRoute>
              <ChildLayout>
                <ChildRewards />
              </ChildLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/child/:childId/badges"
          element={
            <ProtectedRoute>
              <ChildLayout>
                <ChildBadges />
              </ChildLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout>
                <AdminActivities />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
