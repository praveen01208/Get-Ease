import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseCard } from '@/components/cards/CourseCard';
import { studentApi } from '@/lib/studentApi';
import { PlayCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';

export const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await studentApi.getEnrolledCourses();
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-primary mb-2">My Learning</h1>
            <p className="text-secondary">Pick up where you left off</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enrollments.map((enrollment) => (
                <GlassCard 
                  key={enrollment.id}
                  className="group flex flex-col overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 transition-all duration-300"
                  onClick={() => navigate(`/courses/${enrollment.course.slug}/learn`)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                    <img 
                      src={enrollment.course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'} 
                      alt={enrollment.course.title} 
                      className="w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-brand-500 rounded-full p-3 shadow-lg shadow-brand-500/30">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2 leading-snug">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-secondary mb-4">{enrollment.course.instructor?.name}</p>
                    
                    <div className="mt-auto pt-4 border-t border-white/[0.04]">
                      <div className="text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
                        Continue Learning →
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {enrollments.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">No courses yet</h3>
                  <p className="text-secondary mb-6">Start your learning journey today.</p>
                  <button 
                    onClick={() => navigate('/courses')}
                    className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
