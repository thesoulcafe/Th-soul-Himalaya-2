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
  showThumbnails?: boolean;
  thumbnailClassName?: string;
}

export default function ImageSlider({ 
  images, 
  alt, 
  className, 
  autoSwipe = true, 
  interval = 3000,
  showThumbnails = false,
  thumbnailClassName
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSwipeEnabled, setAutoSwipeEnabled] = useState(autoSwipe);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousOverflowRef = useRef<string>("");

  const startHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    // User requested "immediately", but we use a tiny timeout to avoid triggering on quick taps
    holdTimerRef.current = setTimeout(() => {
      setIsZoomed(true);
      setIsPaused(true);
      previousOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }, 50); 
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    if (isZoomed) {
      setIsZoomed(false);
      // Wait 2 seconds before restarting auto-swipe
      setTimeout(() => {
        setIsPaused(false);
        setHasInteracted(false); 
      }, 2000);
      document.body.style.overflow = previousOverflowRef.current || 'unset';
    } else {
      setIsPaused(false);
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (isZoomed) document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  useEffect(() => {
    // If user has interacted, stop auto-swiping permanently for this component instance
    if (!autoSwipeEnabled || isPaused || hasInteracted || images.length <= 1) return;

    // Desynchronize by adding a random delay before the first transition
    const desyncDelay = Math.random() * interval;
    
    let timer: NodeJS.Timeout;
    
    const timeout = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }, desyncDelay);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, [autoSwipeEnabled, isPaused, hasInteracted, images.length, interval]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!showThumbnails || !thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current?.children[currentIndex] as HTMLElement;
    if (activeThumb && thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, showThumbnails]);

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
          loading="lazy"
        />
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setHasInteracted(true);
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    if (index === currentIndex) return;
    setHasInteracted(true);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Pre-fetch images and handle index bounds
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
      return;
    }
    
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    [nextIndex, prevIndex].forEach(index => {
      const img = new Image();
      img.src = images[index];
    });
  }, [currentIndex, images]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div 
        ref={containerRef}
        className={cn("relative group overflow-hidden touch-pan-y flex-1 min-h-0", !showThumbnails && "h-full")}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          endHold();
        }}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerCancel={endHold}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || images[0]}
            alt={`${alt} - ${currentIndex + 1}`}
            custom={direction}
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
            dragDirectionLock={true}
            style={{ touchAction: "pan-y" }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeConfidenceThreshold = 10000;
              const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
            onContextMenu={(e) => e.preventDefault()}
          />
        </AnimatePresence>

        {/* Zoomed View Portal-like Overlay */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
              >
                <img 
                  src={images[currentIndex]} 
                  alt={alt}
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10"
                />
                <div className="mt-8 text-white text-center">
                  <h3 className="text-2xl md:text-3xl font-playfair font-black italic tracking-tighter uppercase mb-2">{alt}</h3>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Himalayan Perspectives</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Manual Control Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hasInteracted) {
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

          {!showThumbnails && (
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
          )}
        </div>
      </div>

      {showThumbnails && (
        <div className={cn("relative px-2", thumbnailClassName)}>
          <div 
            ref={thumbnailsRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  selectImage(idx);
                }}
                className={cn(
                  "flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden snap-center transition-all duration-300 border-2",
                  currentIndex === idx 
                    ? "border-terracotta scale-105" 
                    : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <img 
                  src={src} 
                  alt={`${alt} thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          {/* Gradient Fades */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-cream/50 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream/50 to-transparent pointer-events-none" />
        </div>
      )}
    </div>
  );
}
