import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Heart, PlayCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/learning';
import { cn } from '@/utils/cn';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

export interface FeaturedCourseCardProps {
  course: any; // course row from /courses (includes category, instructor, _count, totalDuration)
  isPurchased?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (courseId: string) => void;
}

export const FeaturedCourseCard = ({
  course,
  isPurchased,
  isWishlisted,
  onToggleWishlist,
}: FeaturedCourseCardProps) => {
  const navigate = useNavigate();
  const rating = course.rating ?? 4.8;
  const students = course._count?.enrollments ?? 0;

  return (
    <GlassCard
      className="group flex flex-col overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 transition-all duration-300"
      onClick={() => navigate(`/courses/${course.slug}`)}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        <img
          src={course.thumbnail || FALLBACK_THUMB}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="glass" className="bg-black/50 backdrop-blur-md border-white/10 text-white font-medium">
            {course.category?.name || 'Course'}
          </Badge>
        </div>
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(course.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all',
              isWishlisted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-black/50 border-white/10 text-white/70 hover:text-white'
            )}
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-primary mb-1 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-secondary mb-3">{course.instructor?.name || 'GetEase Instructor'}</p>

        <div className="flex items-center gap-3.5 text-xs text-secondary mb-4 font-medium">
          <span className="flex items-center gap-1 text-warning">
            <Star className="w-3.5 h-3.5 fill-current" /> {rating.toFixed(1)}
          </span>
          {students > 0 && <span>{students.toLocaleString()} learners</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 opacity-70" /> {formatDuration(course.totalDuration)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.04]">
          {isPurchased ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course.slug}/learn`);
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              <PlayCircle className="w-4 h-4" /> Continue Learning
            </button>
          ) : (
            <>
              <span className="text-lg font-bold text-primary tracking-tight">
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.slug}`);
                }}
                className="px-4 h-9 rounded-full bg-primary text-background text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-[0.98]"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
