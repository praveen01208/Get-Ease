import React from "react";
import { GlassCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Star, Clock, Users } from "lucide-react";

export interface CourseCardProps {
  title: string;
  thumbnail: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: string | number;
}

export const CourseCard = ({
  title,
  thumbnail,
  category,
  instructor,
  rating,
  students,
  duration,
  price,
}: CourseCardProps) => {
  return (
    <GlassCard className="group flex flex-col overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 transition-all duration-300">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="glass" className="bg-black/50 backdrop-blur-md border-white/10 text-white font-medium">
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2 leading-snug">{title}</h3>
          <p className="text-sm text-secondary mb-4">{instructor}</p>
        </div>
        
        <div className="flex items-center gap-4 text-[13px] text-secondary mb-5 font-medium">
          <div className="flex items-center gap-1.5 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 opacity-70" />
            <span>{students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 opacity-70" />
            <span>{duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
          <span className="text-xl font-bold text-primary tracking-tight">
            {typeof price === "number" ? `$${price.toFixed(2)}` : price}
          </span>
          <span className="text-sm font-semibold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            View Course →
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
