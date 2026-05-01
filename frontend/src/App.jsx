import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CVList from "./pages/CVList";
import CVBuilder from "./pages/CVBuilder";
import CVEdit from "./pages/CVEdit";
import CVDetail from "./pages/CVDetail";
import Interview from "./pages/Interview";
import InterviewFlashcard from "./pages/InterviewFlashcard";
import InterviewQuiz from "./pages/InterviewQuiz";
import InterviewStar from "./pages/InterviewStar";
import Advice from "./pages/Advice";
import AdviceCategory from "./pages/AdviceCategory";
import AdviceDetail from "./pages/AdviceDetail";
import ScholarshipList from "./pages/ScholarshipList";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import ScholarshipForm from "./pages/ScholarshipForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminInterview from "./pages/AdminInterview";
import AdminAdvice from "./pages/AdminAdvice";
import AdminScholarship from "./pages/AdminScholarship";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function PrivateRoute({ children }) {
  var { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  var { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  var { loading } = useAuth();
  if (loading) return <p className="text-center mt-20 text-gray-500">Ачааллаж байна...</p>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/cv" element={<PrivateRoute><CVList /></PrivateRoute>} />
      <Route path="/cv/new" element={<PrivateRoute><CVBuilder /></PrivateRoute>} />
      <Route path="/cv/:id" element={<PrivateRoute><CVDetail /></PrivateRoute>} />
      <Route path="/cv/:id/edit" element={<PrivateRoute><CVEdit /></PrivateRoute>} />
      <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
      <Route path="/interview/flashcard" element={<PrivateRoute><InterviewFlashcard /></PrivateRoute>} />
      <Route path="/interview/quiz" element={<PrivateRoute><InterviewQuiz /></PrivateRoute>} />
      <Route path="/interview/star" element={<PrivateRoute><InterviewStar /></PrivateRoute>} />
      <Route path="/advice" element={<PrivateRoute><Advice /></PrivateRoute>} />
      <Route path="/advice/detail/:id" element={<PrivateRoute><AdviceDetail /></PrivateRoute>} />
      <Route path="/advice/:category" element={<PrivateRoute><AdviceCategory /></PrivateRoute>} />
      <Route path="/scholarship" element={<PrivateRoute><ScholarshipList /></PrivateRoute>} />
      <Route path="/scholarship/new" element={<AdminRoute><ScholarshipForm /></AdminRoute>} />
      <Route path="/scholarship/:id" element={<PrivateRoute><ScholarshipDetail /></PrivateRoute>} />
      <Route path="/scholarship/:id/edit" element={<AdminRoute><ScholarshipForm /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/interview" element={<AdminRoute><AdminInterview /></AdminRoute>} />
      <Route path="/admin/advice" element={<AdminRoute><AdminAdvice /></AdminRoute>} />
      <Route path="/admin/scholarship" element={<AdminRoute><AdminScholarship /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" containerClassName="app-toaster" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
