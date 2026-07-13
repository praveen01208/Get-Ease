import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FeaturedCourseCard } from '@/components/student/FeaturedCourseCard';
import { studentApi } from '@/lib/studentApi';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';

const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const priceFilters = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];
const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title', label: 'A – Z' },
];

export const CourseCatalog = () => {
  const { isAuthenticated } = useAuthStore();

  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('All Levels');
  const [price, setPrice] = useState('');
  const [sort, setSort] = useState('');

  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const debounceRef = useRef<any>(null);

  const fetchCourses = async (params: any) => {
    try {
      const { data } = await studentApi.getCourses(params);
      if (data.success) {
        setCourses(data.data);
        // Build the category filter from all fetched courses on first load
        setCategories((prev) => {
          if (prev.length > 0) return prev;
          const map = new Map<string, any>();
          data.data.forEach((c: any) => c.category && map.set(c.category.id, c.category));
          return [...map.values()];
        });
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty !== 'All Levels') params.difficulty = difficulty;
    if (price) params.price = price;
    if (sort) params.sort = sort;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(params), search ? 250 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, category, difficulty, price, sort]);

  useEffect(() => {
    if (!isAuthenticated) return;
    studentApi.getEnrolledCourses()
      .then(({ data }) => data.success && setEnrolledIds(new Set(data.data.map((e: any) => e.courseId))))
      .catch(() => {});
    studentApi.getWishlist()
      .then(({ data }) => data.success && setWishlistIds(new Set(data.data.map((w: any) => w.courseId))))
      .catch(() => {});
  }, [isAuthenticated]);

  const toggleWishlist = async (courseId: string) => {
    if (!isAuthenticated) return;
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
        studentApi.removeFromWishlist(courseId).catch(() => {});
      } else {
        next.add(courseId);
        studentApi.addToWishlist(courseId).catch(() => {});
      }
      return next;
    });
  };

  const activeFilterCount = useMemo(
    () => [category, difficulty !== 'All Levels' ? difficulty : '', price, sort].filter(Boolean).length,
    [category, difficulty, price, sort]
  );

  return (
    <MainLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-5 tracking-tight">
              Master New Skills with Premium Courses
            </h1>
            <p className="text-lg text-secondary">
              Learn from industry experts. Every course includes a free preview lesson,
              lifetime access and a certificate.
            </p>
          </motion.div>

          {/* Search + filter bar */}
          <div className="glass-card p-4 mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What do you want to learn today?"
                className="w-full h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 text-primary placeholder:text-secondary/60 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary uppercase tracking-wider mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </div>

              {/* Category chips */}
              <button
                onClick={() => setCategory('')}
                className={cn(
                  'h-9 px-4 rounded-full text-sm font-medium border transition-all',
                  !category ? 'bg-primary text-background border-transparent' : 'bg-white/[0.03] border-white/[0.08] text-secondary hover:text-primary'
                )}
              >
                All
              </button>
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(category === c.id ? '' : c.id)}
                  className={cn(
                    'h-9 px-4 rounded-full text-sm font-medium border transition-all',
                    category === c.id ? 'bg-primary text-background border-transparent' : 'bg-white/[0.03] border-white/[0.08] text-secondary hover:text-primary'
                  )}
                >
                  {c.name}
                </button>
              ))}

              <div className="flex flex-wrap gap-3 ml-auto">
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="admin-input !w-auto !h-9 text-xs">
                  {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={price} onChange={(e) => setPrice(e.target.value)} className="admin-input !w-auto !h-9 text-xs">
                  {priceFilters.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="admin-input !w-auto !h-9 text-xs">
                  {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 glass-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <FeaturedCourseCard
                  key={course.id}
                  course={course}
                  isPurchased={enrolledIds.has(course.id)}
                  isWishlisted={wishlistIds.has(course.id)}
                  onToggleWishlist={isAuthenticated ? toggleWishlist : undefined}
                />
              ))}
              {courses.length === 0 && (
                <div className="col-span-full py-16 text-center text-secondary">
                  No courses match your filters. Try clearing them.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
