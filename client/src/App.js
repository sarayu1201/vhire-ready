import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseAccess from './pages/CourseAccess';
import MyCourses from './pages/MyCourses';
import Survey from './pages/Survey';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/home"                    element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile"                 element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/courses"                 element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/courses/:id"             element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/course-access/:courseId" element={<PrivateRoute><CourseAccess /></PrivateRoute>} />
          <Route path="/my-courses"              element={<PrivateRoute><MyCourses /></PrivateRoute>} />
          <Route path="/survey"                  element={<PrivateRoute><Survey /></PrivateRoute>} />
          <Route path="/about"                   element={<PrivateRoute><About /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
