import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import AdminLayout from "./layouts/AdminLayout";
import SurveyorLayout from "./layouts/SurveyorLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/admin/Dashboard";
import Files from "./pages/admin/Files";
import Users from "./pages/admin/Users";
import Statistics from "./pages/admin/Statistics";
import SuperAdminDashboard from "./pages/superadmin/superAdminDashboard";
import SuperFiles from "./pages/superadmin/SuperFiles";
import SuperUsers from "./pages/superadmin/SuperUsers";
import Landing from "./pages/surveyor/Landing";
import WithVoterId from "./pages/survey/WithVoterId";
import WithoutVoterId from "./pages/survey/WithoutVoterId";
import SurveyWithoutVoterId from "./pages/survey/SurveyWithoutVoterId";
import SurveyWithVoterId from "./pages/survey/SurveyWithVoterId";
import PollDay from "./pages/status/PollDay";
import Survey from "./pages/status/survey";
import VerifiedStatus from "./pages/status/VerifiedStatus";
import { useAuth } from "./hooks/useAuth";
import Footer from "./components/footer";
import { CircularProgress, Box } from "@mui/material";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();

  // New logic: Check if the user is a superadmin or if the roles match.
  // A superadmin can access all 'admin' routes.
  if (userRole === "superadmin" || userRole === normalizedRequiredRole) {
    return children;
  }

  // Redirect logic for users who don't have permission
  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userRole === "Surveyor") {
    return <Navigate to="/surveyor/home" replace />;
  }
  // All other cases (including 'superadmin' trying to access 'surveyor' routes)
  // will redirect to login. You may want to adjust this logic later.
  return <Navigate to="/login" replace />;
}

// src/App.jsx

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // New logic: Check for 'superadmin' first, then 'admin'
  if (user?.role?.toLowerCase() === "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role?.toLowerCase() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role?.toLowerCase() === "surveyor") {
    return <Navigate to="/surveyor/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

         <Route path="/superadmin" element={
          <ProtectedRoute requiredRole="superadmin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="SuperAdminDashboard" element={<SuperAdminDashboard />} />
          <Route path="SuperFiles" element={<SuperFiles />} />
          <Route path="SuperUsers" element={<SuperUsers />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="survey/with-voter-id" element={<WithVoterId from="superadmin" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="superadmin" />} />
          <Route path="without-voter-id/form/*" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form/:id/:surveyName" element={<SurveyWithVoterId />} />
          <Route path="status/poll-day" element={<PollDay />}/>
          <Route path="status/survey" element={<Survey/>}/>
          <Route path="status/verification-status" element={<VerifiedStatus />}/>
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="files" element={<Files />} />
          <Route path="users" element={<Users />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="survey/with-voter-id" element={<WithVoterId from="admin" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="admin" />} />
          <Route path="without-voter-id/form/*" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form/:id/:surveyName" element={<SurveyWithVoterId />} />
          <Route path="status/poll-day" element={<PollDay />}/>
          <Route path="status/verification-status" element={<VerifiedStatus />}/>
        </Route>

        <Route path="/surveyor" element={
          <ProtectedRoute requiredRole="surveyor">
            <SurveyorLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<Landing />} />
          <Route path="survey/with-voter-id" element={<WithVoterId from="surveyor" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="surveyor" />} />
          <Route path="without-voter-id/form/*" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form/:id/:surveyName" element={<SurveyWithVoterId />} />
          <Route path="status/poll-day" element={<PollDay />}/>
          <Route path="status/verification-status" element={<VerifiedStatus />}/>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}