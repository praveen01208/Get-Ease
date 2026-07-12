import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/cards/CourseCard';
import { studentApi } from '@/lib/studentApi';

export const CourseCatalog = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await studentApi.getCourses();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
              Master New Skills with Premium Courses
            </h1>
            <p className="text-lg text-secondary">
              Learn from industry experts with high-quality video courses.
              Get lifetime access and earn certificates upon completion.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <div key={course.id} onClick={() => navigate(`/courses/${course.slug}`)}>
                  <CourseCard
                    title={course.title}
                    thumbnail={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                    category={course.category?.name || 'Development'}
                    instructor={course.instructor?.name || 'Instructor'}
                    rating={4.8}
                    students={1200}
                    duration={`${Math.round(course.totalDuration / 60)}h ${course.totalDuration % 60}m`}
                    price={course.price === 0 ? 'Free' : course.price}
                  />
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full py-12 text-center text-secondary">
                  No courses found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
