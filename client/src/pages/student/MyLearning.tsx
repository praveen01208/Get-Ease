import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { studentApi } from '@/lib/studentApi';
import { CourseProgressCard } from '@/components/student/CourseProgressCard';
import { EmptyState } from '@/components/student/ui';

export const MyLearning = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getDashboard()
      .then(({ data }) => data.success && setItems(data.data.myLearning))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">My Learning</h1>
        <p className="text-secondary">Every course you own, in one place</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-80 glass-card animate-pulse" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m: any) => (
            <CourseProgressCard
              key={m.enrollmentId}
              course={m.course}
              completedLessons={m.completedLessons}
              totalLessons={m.totalLessons}
              percentage={m.percentage}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="You haven't purchased any courses yet"
          message="Explore our premium courses — every course includes a free preview lesson."
          action={
            <Link to="/courses" className="h-11 px-6 rounded-full bg-primary text-background text-sm font-semibold inline-flex items-center hover:bg-primary/90 transition-colors">
              Browse Courses
            </Link>
          }
        />
      )}
    </div>
  );
};
