import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  backgroundImage?: string;
  fallbackImage?: string;
  className?: string;
  children?: React.ReactNode;
  overlayClassName?: string;
  height?: string;
}

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80";

export default function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  fallbackImage = DEFAULT_FALLBACK,
  className,
  children,
  overlayClassName,
  height = "h-screen min-h-[600px]"
}: HeroSectionProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const finalImage = backgroundImage || fallbackImage;

  return (
    <section 
      ref={containerRef} 
      className={cn("relative w-full flex items-center justify-center overflow-hidden", height, className)}
    >
      <div className="absolute inset-0 z-0">
        <motion.div 
          style={{ y }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img
            src={finalImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        
        {/* Advanced Layered Overlays */}
        <div className={cn("absolute inset-0 bg-gradient-to-b from-forest/40 via-transparent to-forest/90", overlayClassName)} />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-forest to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {subtitle && (
            <motion.div 
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-terracotta font-montserrat font-bold uppercase text-[10px] md:text-xs mt-0 mb-4 tracking-[0.2em] drop-shadow-sm"
            >
              {subtitle}
            </motion.div>
          )}
          
          {title && (
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-montserrat font-extrabold text-white mb-4 leading-[0.95] tracking-tighter drop-shadow-2xl flex flex-col items-center gap-1 md:gap-2 italic">
              {title}
            </h1>
          )}

          {description && (
            <p className="text-xs xs:text-sm md:text-base text-cream/80 mb-8 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-md backdrop-blur-[2px] px-4">
              {description}
            </p>
          )}

          {children}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <span className="text-[10px] text-white font-bold uppercase tracking-widest hidden sm:block">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}
