import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { studentApi } from '@/lib/studentApi';
import { FeaturedCourseCard } from '@/components/student/FeaturedCourseCard';
import { EmptyState } from '@/components/student/ui';

export const WishlistPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([studentApi.getWishlist(), studentApi.getEnrolledCourses()])
      .then(([w, e]) => {
        if (w.status === 'fulfilled' && w.value.data.success) setItems(w.value.data.data);
        if (e.status === 'fulfilled' && e.value.data.success) {
          setEnrolledIds(new Set(e.value.data.data.map((en: any) => en.courseId)));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const remove = async (courseId: string) => {
    setItems((prev) => prev.filter((w) => w.courseId !== courseId));
    await studentApi.removeFromWishlist(courseId).catch(() => {});
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">Wishlist</h1>
        <p className="text-secondary">Courses you've saved for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-80 glass-card animate-pulse" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((w: any) => (
            <FeaturedCourseCard
              key={w.id}
              course={w.course}
              isPurchased={enrolledIds.has(w.courseId)}
              isWishlisted
              onToggleWishlist={remove}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Tap the heart icon on any course to keep it here until you're ready."
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
