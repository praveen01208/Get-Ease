import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { Landing } from "@/pages/Landing";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminCourses } from "@/pages/admin/Courses";
import { AdminCourseBuilder } from "@/pages/admin/CourseBuilderPage";
import { AdminCategories } from "@/pages/admin/Categories";
import { AdminStudents } from "@/pages/admin/Students";
import { AdminMediaLibrary } from "@/pages/admin/MediaLibrary";
import { CourseCatalog } from "@/pages/CourseCatalog";
import { CourseDetails } from "@/pages/CourseDetails";
import { CoursePlayer } from "@/pages/CoursePlayer";
import { StudentDashboard } from "@/pages/StudentDashboard";
import {
  Pricing, About, Contact, NotFound
} from "@/pages/Placeholders";

// Show the splash only on the very first visit in a browser session
const hasSeenSplash = sessionStorage.getItem("splash-shown");

function App() {
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  const handleSplashComplete = () => {
    sessionStorage.setItem("splash-shown", "1");
    setShowSplash(false);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      {/* BrowserRouter is ALWAYS mounted so the router exists even during splash */}
      <BrowserRouter>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
        <div style={{ display: showSplash ? "none" : "block" }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/courses/:slug/learn" element={
              <ProtectedRoute>
                <CoursePlayer />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Protected (ADMIN role required) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:courseId/edit" element={<AdminCourseBuilder />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="media" element={<AdminMediaLibrary />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

