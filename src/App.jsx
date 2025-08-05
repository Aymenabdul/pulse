import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import AdminLayout from "./layouts/AdminLayout";
import SurveyorLayout from "./layouts/SurveyorLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/admin/Dashboard";
import Files from "./pages/admin/Files";
import Users from "./pages/admin/Users";
import Statistics from "./pages/admin/Statistics";
import Landing from "./pages/surveyor/Landing";
import WithVoterId from "./pages/survey/WithVoterId";
import WithoutVoterId from "./pages/survey/WithoutVoterId";
import SurveyWithoutVoterId from "./pages/survey/SurveyWithoutVoterId";
import SurveyWithVoterId from "./pages/survey/SurveyWithVoterId";
import { useAuth } from "./hooks/useAuth";
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

  // Check if user has the required role for this route
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate home page based on user's actual role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "surveyor") {
      return <Navigate to="/surveyor/home" replace />;
    }
  }

  return children;
}

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

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === "Surveyor") {
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
        </Route>

        <Route path="/surveyor" element={
          <ProtectedRoute requiredRole="surveyor">
            <SurveyorLayout />
          </ProtectedRoute>
        }>
          <Route path="home" element={<Landing />} />
          <Route path="survey/with-voter-id" element={<WithVoterId from="surveyor" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="surveyor" />} />
          <Route path="without-voter-id/form" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form" element={<SurveyWithVoterId />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}