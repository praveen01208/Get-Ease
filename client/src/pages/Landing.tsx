import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { CourseCard } from "@/components/cards/CourseCard";
import { SearchBar } from "@/components/ui/Input";

const FEATURED_COURSES = [
  {
    id: 1,
    title: "Advanced System Design & Architecture",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    category: "Engineering",
    instructor: "David Chen",
    rating: 4.9,
    students: 12500,
    duration: "45h 20m",
    price: 199.99
  },
  {
    id: 2,
    title: "Full-Stack Web Development Bootcamp",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    category: "Development",
    instructor: "Sarah Williams",
    rating: 4.8,
    students: 8300,
    duration: "62h 15m",
    price: 149.99
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
    category: "Design",
    instructor: "Elena Rodriguez",
    rating: 4.9,
    students: 6200,
    duration: "32h 40m",
    price: 129.99
  }
];

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full bg-[#09090B]">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-poster.webp"
            className="w-full h-full object-cover opacity-[0.55]"
          >
            <source src="/videos/intro.mp4" type="video/mp4" />
          </video>
          {/* Subtle gradient overlay to blend seamlessly with background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Built for students.<br />not billionaires.<br />So Pay Less.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              GetEase — because the same YouTube courses selling for ₹8,000 shouldn't break your hustle.
            </p>
            
            <div className="max-w-xl mx-auto w-full mb-10">
               <SearchBar placeholder="What do you want to learn today?" className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 h-14 w-full rounded-full" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton size="lg" className="rounded-full w-full sm:w-auto px-8">
                Start Learning
              </PrimaryButton>
              <SecondaryButton size="lg" className="rounded-full w-full sm:w-auto px-8 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                Explore Courses
              </SecondaryButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 px-6 lg:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-3">
                Featured Courses
              </h2>
              <p className="text-secondary max-w-2xl text-lg">
                Hand-picked by our experts to help you reach your goals faster.
              </p>
            </div>
            <SecondaryButton className="rounded-full shrink-0">
              View All Courses
            </SecondaryButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_COURSES.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
              >
                <CourseCard {...course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
