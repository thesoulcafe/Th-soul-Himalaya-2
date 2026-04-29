import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, Play, Pause } from 'lucide-react';
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
  const [autoSwipeEnabled, setAutoSwipeEnabled] = useState(autoSwipe);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user has interacted, stop auto-swiping permanently for this component instance
    if (!autoSwipeEnabled || isPaused || hasInteracted || images.length <= 1) return;

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
  }, [autoSwipeEnabled, isPaused, hasInteracted, images.length, interval]);

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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setHasInteracted(true);
    setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
  };

  // Prefetch next and previous images
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    [nextIndex, prevIndex].forEach(index => {
      const img = new Image();
      img.src = images[index];
    });
  }, [currentIndex, images]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative group overflow-hidden touch-pan-y h-full", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hidden prefetcher for all images */}
      <div className="hidden">
        {images.map((src, i) => (
          <link key={i} rel="prefetch" href={src} />
        ))}
      </div>
      <AnimatePresence initial={false} custom={1}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          custom={1}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            setAutoSwipeEnabled(false);
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Manual Control Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasInteracted) {
                // If they interacted but want to resume, we allow it by clearing interaction
                setHasInteracted(false);
                setIsPaused(false);
              } else {
                setIsPaused(!isPaused);
              }
            }}
            className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-all shadow-xl"
            title={isPaused || hasInteracted ? "Play" : "Pause"}
          >
            {isPaused || hasInteracted ? (
              <Play className="h-5 w-5 fill-current" />
            ) : (
              <Pause className="h-5 w-5 fill-current" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/40 transition-all transform -translate-x-4 group-hover:translate-x-0"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/40 transition-all transform translate-x-4 group-hover:translate-x-0"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <div className="flex justify-center gap-1.5 pb-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
