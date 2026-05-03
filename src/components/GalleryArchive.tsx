import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Share2, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

const SAMPLE_IMAGES: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1544735230-c112df2146bc?q=80&w=1000&auto=format&fit=crop',
    title: 'The Sacred Valley',
    description: 'A mystical dawn breaking over the peaks of the Parvati Valley, where the mist dances with the ancient pines.'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc2140?q=80&w=1000&auto=format&fit=crop',
    title: 'Temple of Echoes',
    description: 'An ancient stone temple stands resilient against the elements, a testament to the spiritual heritage of the Himalayas.'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    title: 'Glacial Purity',
    description: 'The crystal clear waters of a high-altitude lake reflecting the snow-capped summits that feed its depths.'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    title: 'Summit Serenity',
    description: 'Reaching the heights where the air thin and the world below seems like a distant memory of chaotic noise.'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=1000&auto=format&fit=crop',
    title: 'Starlit Haven',
    description: 'The night sky reveals its full glory in the absence of city lights, casting a cosmic glow over the silent range.'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1454496522485-0a69e88da117?q=80&w=1000&auto=format&fit=crop',
    title: 'Winter Whispers',
    description: 'A blanket of fresh snow mutes the landscape, creating a monochrome world of breathtaking simplicity.'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1506744038236-4627699ad310?q=80&w=1000&auto=format&fit=crop',
    title: 'Autumnal Glow',
    description: 'The valley floor ignites with gold and crimson as autumn descends upon the lower reaches of the forest.'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop',
    title: 'Cascading Light',
    description: 'Hidden waterfalls revealed by the morning light, their spray creating jewels of moisture on the ancient moss.'
  }
];

interface GalleryArchiveProps {
  images: GalleryImage[];
  title?: string;
  propertyName?: string;
}

export default function GalleryArchive({ 
  images = SAMPLE_IMAGES, 
  title = "Visual Manifest",
  propertyName = "The Soul Himalaya"
}: GalleryArchiveProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(0);

  const nextImage = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    const activeThumb = thumbnailsRef.current?.children[activeIndex] as HTMLElement;
    if (activeThumb && thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const scrollLeft = activeThumb.offsetLeft - container.offsetWidth / 2 + activeThumb.offsetWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full bg-white py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Gallery Container */}
        <div className="relative group">
          {/* Main Viewport */}
          <div className="relative aspect-[3/4] md:aspect-[4/5] mx-auto w-full max-w-[600px] rounded-[2rem] overflow-hidden bg-neutral-100 shadow-2xl">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={activeIndex}
                src={images[activeIndex].url}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </AnimatePresence>

            {/* Pagination Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white font-mono text-xs tracking-widest shadow-lg">
                {activeIndex + 1} <span className="opacity-50 mx-1">/</span> {images.length}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              <button 
                onClick={prevImage}
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all group pointer-events-auto"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={nextImage}
                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all group pointer-events-auto"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Top Controls Overlay */}
            <div className="absolute top-6 right-6 flex gap-3 z-20">
              <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                <Expand className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="mt-8 relative max-w-4xl mx-auto">
            <div 
              ref={thumbnailsRef}
              className="relative flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => selectImage(idx)}
                  className={cn(
                    "thumb-scroll-item relative flex-shrink-0 w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden snap-center transition-all duration-300",
                    activeIndex === idx 
                      ? "ring-2 ring-[#A0522D] ring-offset-2 scale-105 z-10" 
                      : "opacity-40 hover:opacity-100"
                  )}
                >
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    className="thumb-image w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {/* CSS Scroll-Driven Animation Trigger Area (Conceptual) */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      // Note: Standard CSS scroll-driven animations are still emerging
                      // animation: 'scale 1s linear both',
                      // animationTimeline: 'view()',
                    }}
                  />
                </button>
              ))}
              
              {/* View More Trigger */}
              <button className="flex-shrink-0 w-24 h-32 rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 group hover:border-[#A0522D]/30 transition-colors">
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-[#A0522D]/10 text-neutral-400 group-hover:text-[#A0522D] transition-colors">
                  <Expand className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">View All</span>
              </button>
            </div>
            
            {/* Gradient Fades for Scroll */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Discover Section */}
        <section className="max-w-3xl mx-auto text-center space-y-6 pt-8 pb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-neutral-900"
          >
            Discover {propertyName}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 leading-relaxed text-justify px-4"
          >
            {images[activeIndex].description} 
            Experience a symphony of spiritual resonance where every frame tells a story as old as the peaks themselves. 
            Our curated archive captures the ephemeral moments of transcendence that define the path of the Soul Himalaya. 
            From the first blush of morning light on frozen summits to the deep, silent wisdom of ancient cedar forests, 
            these artifacts are designed to transport you to a realm of unqiue peace and monumental beauty.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="pt-6"
          >
            <button className="px-10 py-4 bg-[#A0522D] text-white rounded-full font-sans font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#8B4513] transition-all shadow-xl shadow-[#A0522D]/20">
              Explore Experience
            </button>
          </motion.div>
        </section>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @supports (animation-timeline: view()) {
          .thumb-scroll-item {
            animation: linear thumb-scale both;
            animation-timeline: view(inline);
            animation-range: entry 0% cover 50%, cover 50% exit 100%;
          }

          @keyframes thumb-scale {
            0% { transform: scale(0.85); opacity: 0.4; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0.4; }
          }
        }
      `}</style>
    </div>
  );
}
