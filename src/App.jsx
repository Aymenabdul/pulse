import { BrowserRouter, Routes, Route } from "react-router";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="files" element={<Files />}/>
          <Route path="users" element={<Users />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="survey/with-voter-id" element={<WithVoterId from="admin" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="admin" />} />
        </Route>

        <Route path="/surveyor" element={<SurveyorLayout />}>
          <Route path="home" element={<Landing />} />
          <Route path="urvey/with-voter-id" element={<WithVoterId from="surveyor" />} />
          <Route path="survey/without-voter-id" element={<WithoutVoterId from="surveyor" />} />
          <Route path="without-voter-id/form" element={<SurveyWithoutVoterId />} />
          <Route path="with-voter-id/form" element={<SurveyWithVoterId />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
