import { api } from './axios';

// ─── Categories ────────────────────────────────────────────────────────────────
export const adminApi = {
  // Analytics
  getOverview: () => api.get('/admin/students/analytics/overview'),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data: { name: string; slug: string; description?: string }) =>
    api.post('/admin/categories', data),
  updateCategory: (id: string, data: Partial<{ name: string; slug: string; description: string }>) =>
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Courses
  getCourses: (params?: { page?: number; search?: string; status?: string; limit?: number }) =>
    api.get('/admin/courses', { params }),
  getCourse: (id: string) => api.get(`/admin/courses/${id}`),
  createCourse: (data: {
    title: string; slug: string; description?: string; price?: number;
    categoryId?: string; thumbnail?: string;
  }) => api.post('/admin/courses', data),
  updateCourse: (id: string, data: Record<string, any>) =>
    api.put(`/admin/courses/${id}`, data),
  updateCourseStatus: (id: string, status: string) =>
    api.put(`/admin/courses/${id}/status`, { status }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),

  // Lessons
  getLessons: (courseId: string) => api.get(`/admin/courses/${courseId}/lessons`),
  createLesson: (courseId: string, data: Record<string, any>) =>
    api.post(`/admin/courses/${courseId}/lessons`, data),
  updateLesson: (courseId: string, lessonId: string, data: Record<string, any>) =>
    api.put(`/admin/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId: string, lessonId: string) =>
    api.delete(`/admin/courses/${courseId}/lessons/${lessonId}`),
  reorderLessons: (courseId: string, orderedIds: string[]) =>
    api.put(`/admin/courses/${courseId}/lessons/reorder`, { orderedIds }),
  addResource: (courseId: string, lessonId: string, data: Record<string, any>) =>
    api.post(`/admin/courses/${courseId}/lessons/${lessonId}/resources`, data),
  deleteResource: (courseId: string, resourceId: string) =>
    api.delete(`/admin/courses/${courseId}/lessons/resources/${resourceId}`),

  // Students
  getStudents: (params?: { page?: number }) =>
    api.get('/admin/students', { params }),

  // Uploads — using XMLHttpRequest for progress tracking
  uploadVideo: (
    file: File,
    onProgress: (pct: number) => void
  ): Promise<{
    jobId: string; videoId: string; status: string;
    fileName: string; fileSize: number; mimeType: string;
  }> => {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('video', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/upload/video`);

      const token = (() => {
        try { return JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.accessToken; } catch { return null; }
      })();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) resolve(data.data);
        else reject(new Error(data.message || 'Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(fd);
    });
  },

  getVideoStatus: (videoId: string) =>
    api.get(`/admin/upload/video/${videoId}/status`),

  uploadFile: (
    file: File,
    folder: string,
    onProgress: (pct: number) => void
  ): Promise<{
    jobId: string; fileId: string; storageKey: string; url: string;
    originalFilename: string; mimeType: string; fileSize: number; storageProvider: string;
  }> => {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/upload/file?folder=${folder}`);

      const token = (() => {
        try { return JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.accessToken; } catch { return null; }
      })();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) resolve(data.data);
        else reject(new Error(data.message || 'Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(fd);
    });
  },

  getUploadJobs: () => api.get('/admin/upload/jobs'),
};
