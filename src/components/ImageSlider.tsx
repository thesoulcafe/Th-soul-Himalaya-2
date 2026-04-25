import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
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
  interval = 3000 
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (!autoSwipe || images.length <= 1 || isPaused || !isInView) return;

    // Desynchronize by adding a random delay before the first transition
    const desyncDelay = Math.random() * interval;
    
    let timer: NodeJS.Timeout;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }, desyncDelay);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, [autoSwipe, images.length, interval, isPaused, isInView]);

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

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative group overflow-hidden touch-none", className)}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          style={{ position: 'absolute' }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 z-10"
      >
        <ChevronLeft className="h-4 w-4 text-forest" />
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10"
      >
        <ChevronRight className="h-4 w-4 text-forest" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
