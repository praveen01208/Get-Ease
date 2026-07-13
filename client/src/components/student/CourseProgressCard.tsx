import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { ProgressBar } from './ui';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop';

export interface CourseProgressCardProps {
  course: {
    slug: string;
    title: string;
    thumbnail?: string | null;
    instructor?: { name?: string } | null;
  };
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export const CourseProgressCard = ({
  course,
  completedLessons,
  totalLessons,
  percentage,
}: CourseProgressCardProps) => {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="group flex flex-col overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 transition-all duration-300"
      onClick={() => navigate(`/courses/${course.slug}/learn`)}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        <img
          src={course.thumbnail || FALLBACK_THUMB}
          alt={course.title}
          className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 inset-x-0">
          <ProgressBar value={percentage} className="rounded-none h-1" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-primary mb-1 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="text-xs text-secondary mb-4">{course.instructor?.name || 'GetEase Instructor'}</p>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>{completedLessons} of {totalLessons} lessons</span>
            <span className="font-semibold text-primary">{percentage}%</span>
          </div>
          <ProgressBar value={percentage} />
          <div className="mt-4 text-sm font-semibold text-primary/90 group-hover:text-primary transition-colors">
            Continue →
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
