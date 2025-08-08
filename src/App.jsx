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

  const userRole = user.role?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();

  if (normalizedRequiredRole && userRole !== normalizedRequiredRole) {
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "surveyor") {
      return <Navigate to="/surveyor/home" replace />;
    }
    return <Navigate to="/login" replace />;
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

  if (user?.role === "admin" || user?.role === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === "Surveyor" || user?.role === "surveyor") {
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
          <Route path="without-voter-id/form/*" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form/:id" element={<SurveyWithVoterId />} />
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
          <Route path="with-voter-id/form/:id" element={<SurveyWithVoterId />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}