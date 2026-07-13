import { api } from './axios';

export const studentApi = {
  // Courses
  getCourses: (params?: {
    category?: string;
    search?: string;
    difficulty?: string;
    price?: string;
    sort?: string;
  }) => api.get('/courses', { params }),

  getCourseBySlug: (slug: string) =>
    api.get(`/courses/${slug}`),

  // Enrollment & Progress
  getEnrolledCourses: () =>
    api.get('/courses/my/enrolled'),

  enrollInCourse: (courseId: string) =>
    api.post(`/courses/${courseId}/enroll`),

  getCourseProgress: (courseId: string) =>
    api.get(`/courses/${courseId}/progress`),

  toggleLessonProgress: (lessonId: string, completed: boolean) =>
    api.post(`/courses/lesson/${lessonId}/progress`, { completed }),

  saveWatchProgress: (lessonId: string, courseId: string, data: { timestamp: number; playbackSpeed: number }) =>
    api.post(`/courses/lesson/${lessonId}/watch-time`, { ...data, courseId }),

  // Payments
  getPaymentConfig: () => api.get('/payments/config'),

  createPaymentOrder: (courseId: string) =>
    api.post('/payments/create-order', { courseId }),

  verifyPayment: (data: {
    courseId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string
  }) => api.post('/payments/verify', data),

  // Dashboard
  getDashboard: () => api.get('/student/dashboard'),

  // Wishlist
  getWishlist: () => api.get('/student/wishlist'),
  addToWishlist: (courseId: string) => api.post(`/student/wishlist/${courseId}`),
  removeFromWishlist: (courseId: string) => api.delete(`/student/wishlist/${courseId}`),

  // Purchases
  getPurchases: () => api.get('/student/purchases'),

  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data: { name?: string; phone?: string | null; avatar?: string | null }) =>
    api.patch('/student/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/student/profile/password', data),
};
