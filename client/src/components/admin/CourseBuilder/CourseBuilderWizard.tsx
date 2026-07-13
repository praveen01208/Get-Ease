import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, BookOpen, Film, Paperclip, DollarSign, Search, Rocket } from 'lucide-react';
import { cn } from '@/utils/cn';
import { adminApi } from '@/lib/adminApi';
import { BasicDetails } from './steps/BasicDetails';
import { LessonsStep } from './steps/Lessons';
import { ResourcesStep } from './steps/Resources';
import { PricingStep } from './steps/Pricing';
import { SEOStep } from './steps/SEO';
import { PublishStep } from './steps/Publish';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const STEPS: Step[] = [
  { id: 'basic',     label: 'Basic Details', icon: <BookOpen className="w-4 h-4" />,   description: 'Title, description, category' },
  { id: 'lessons',   label: 'Lessons',       icon: <Film className="w-4 h-4" />,       description: 'Add and organize lessons' },
  { id: 'resources', label: 'Resources',     icon: <Paperclip className="w-4 h-4" />,  description: 'Attach files and links' },
  { id: 'pricing',   label: 'Pricing',       icon: <DollarSign className="w-4 h-4" />, description: 'Set price and access' },
  { id: 'seo',       label: 'SEO',           icon: <Search className="w-4 h-4" />,     description: 'Slug, meta tags' },
  { id: 'publish',   label: 'Publish',       icon: <Rocket className="w-4 h-4" />,     description: 'Review and go live' },
];

export const CourseBuilderWizard: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isNew = courseId === 'new';

  const [activeStep, setActiveStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && courseId) {
      adminApi.getCourse(courseId)
        .then((res) => { setCourse(res.data.data); setIsLoading(false); })
        .catch(() => navigate('/admin/courses'));
    }
  }, [courseId]);

  const markComplete = (stepId: string) =>
    setCompletedSteps((prev) => new Set([...prev, stepId]));

  const onCourseCreated = (newCourse: any) => {
    setCourse(newCourse);
    markComplete('basic');
    navigate(`/admin/courses/${newCourse.id}/edit`, { replace: true });
    setActiveStep('lessons');
  };

  const canAccessStep = (stepId: string) => {
    if (stepId === 'basic') return true;
    return !!course?.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const renderStep = () => {
    switch (activeStep) {
      case 'basic':     return <BasicDetails course={course} onSaved={onCourseCreated} onUpdate={(c) => setCourse(c)} />;
      case 'lessons':   return <LessonsStep course={course} />;
      case 'resources': return <ResourcesStep course={course} />;
      case 'pricing':   return <PricingStep course={course} onUpdate={(c) => { setCourse(c); markComplete('pricing'); }} />;
      case 'seo':       return <SEOStep course={course} onUpdate={(c) => { setCourse(c); markComplete('seo'); }} />;
      case 'publish':   return <PublishStep course={course} onUpdate={(c) => setCourse(c)} />;
      default:          return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 h-full">
      {/* Mobile: horizontal scrollable step tabs */}
      <div className="lg:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {STEPS.map((step, i) => {
            const isActive = activeStep === step.id;
            const isComplete = completedSteps.has(step.id);
            const canAccess = canAccessStep(step.id);
            return (
              <button
                key={step.id}
                onClick={() => canAccess && setActiveStep(step.id)}
                disabled={!canAccess}
                className={cn(
                  'shrink-0 snap-start flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white/10 border-white/20 text-primary'
                    : 'bg-white/[0.03] border-white/[0.08] text-secondary',
                  !canAccess && 'opacity-40'
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                  isComplete ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-secondary'
                )}>
                  {isComplete ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
        {course && (
          <div className={cn(
            'inline-flex mt-3 px-3 py-1 rounded-lg text-[11px] font-semibold border',
            course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            course.status === 'ARCHIVED'  ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            'bg-white/[0.06] text-secondary border-white/[0.08]'
          )}>
            {course.status}
          </div>
        )}
      </div>

      {/* Desktop: Left Sidebar Wizard Navigation */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="glass-card rounded-2xl p-2 sticky top-0">
          {STEPS.map((step, i) => {
            const isActive = activeStep === step.id;
            const isComplete = completedSteps.has(step.id);
            const canAccess = canAccessStep(step.id);

            return (
              <button
                key={step.id}
                onClick={() => canAccess && setActiveStep(step.id)}
                disabled={!canAccess}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-150',
                  isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]',
                  !canAccess && 'opacity-40 cursor-not-allowed'
                )}
              >
                {/* Step indicator */}
                <div className={cn(
                  'w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border transition-colors',
                  isComplete
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : isActive
                      ? 'bg-white/10 border-white/20 text-primary'
                      : 'bg-white/[0.04] border-white/[0.08] text-secondary'
                )}>
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={cn('text-sm font-semibold truncate', isActive ? 'text-primary' : 'text-secondary')}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-secondary/60 truncate">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Course status pill */}
        {course && (
          <div className="mt-4 px-2">
            <p className="text-[11px] text-secondary/60 uppercase tracking-wider mb-2">Status</p>
            <div className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold border text-center',
              course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              course.status === 'ARCHIVED'  ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              'bg-white/[0.06] text-secondary border-white/[0.08]'
            )}>
              {course.status}
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        {renderStep()}
      </div>
    </div>
  );
};
