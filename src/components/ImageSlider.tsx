import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  alt: string;
  className?: string;
  autoSwipe?: boolean;
  interval?: number;
}

export default function ImageSlider({ 
  images, 
  alt, 
  className, 
  autoSwipe = true, 
  interval = 2500 
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoSwipe || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoSwipe, images.length, interval]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("bg-forest/5 flex items-center justify-center", className)}>
        <span className="text-forest/20 text-xs font-bold uppercase tracking-widest">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn("relative group overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0"
      >
        <ChevronLeft className="h-4 w-4 text-forest" />
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
      >
        <ChevronRight className="h-4 w-4 text-forest" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
