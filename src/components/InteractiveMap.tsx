import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCATIONS = [
  { id: 'kasol', name: 'Kasol', cx: 200, cy: 350, description: 'The mini-Israel of India and base camp for the valley.' },
  { id: 'malana', name: 'Malana', cx: 120, cy: 150, description: 'The ancient village of the descendants of Alexander.' },
  { id: 'pulga', name: 'Pulga', cx: 350, cy: 250, description: 'Home to the magical fairy forest.' },
  { id: 'kalga', name: 'Kalga', cx: 400, cy: 220, description: 'Apple orchards and serene hippie vibe.' },
  { id: 'tosh', name: 'Tosh', cx: 500, cy: 180, description: 'Gateway to the Pin Parvati Pass.' },
  { id: 'kheerganga', name: 'Kheerganga', cx: 650, cy: 100, description: 'Sacred hot springs in the high Himalayas.' },
];

export default function InteractiveMap() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 relative">
      <div className="text-center mb-10">
        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-forest mb-4">Explore the Map</h3>
        <p className="text-forest/60 font-medium max-w-xl mx-auto">Hover over or tap the waypoints to preview the hamlets of Parvati Valley, then click to journey there.</p>
      </div>

      <div className="relative aspect-[4/3] md:aspect-video w-full rounded-[2.5rem] bg-cream border border-forest/10 overflow-hidden shadow-2xl">
        {/* SVG Map Canvas */}
        <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
          {/* Topographic Lines / Abstract Paths */}
          <path d="M 0 450 Q 150 400 200 350 T 400 250 T 500 180 T 650 100 Q 750 50 800 0" fill="none" stroke="#2d3e35" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.2" className="animate-pulse" />
          <path d="M -50 300 Q 100 200 120 150 T 350 100" fill="none" stroke="#2d3e35" strokeWidth="1" strokeOpacity="0.1" />
          
          {/* Parvati River */}
          <path d="M 0 480 Q 180 430 220 370 T 450 280 T 550 200 T 800 120" fill="none" stroke="#3b82f6" strokeWidth="8" strokeOpacity="0.2" />

          {/* Mountains */}
          <path d="M 400 100 L 450 20 L 500 100 Z" fill="#2d3e35" fillOpacity="0.05" />
          <path d="M 550 150 L 620 40 L 690 150 Z" fill="#2d3e35" fillOpacity="0.05" />
          <path d="M 100 250 L 170 120 L 240 250 Z" fill="#2d3e35" fillOpacity="0.05" />

          {/* Nodes */}
          {LOCATIONS.map((loc) => (
            <g 
              key={loc.id}
              className="cursor-pointer group"
              onMouseEnter={() => setActiveLocation(loc.id)}
              onMouseLeave={() => setActiveLocation(null)}
              onClick={() => { setActiveLocation(loc.id) }}
            >
              {/* Pulse effect */}
              <circle cx={loc.cx} cy={loc.cy} r="16" fill="#e66345" fillOpacity="0.2" className={cn("transition-all duration-300", activeLocation === loc.id ? "scale-150 animate-ping" : "group-hover:scale-125")} />
              
              {/* Core point */}
              <circle cx={loc.cx} cy={loc.cy} r="6" fill="#e66345" className="transition-transform duration-300 group-hover:scale-125 shadow-xl" />
              
              {/* Map Pin Icon (Rendered via foreignObject for Lucide icons or raw paths) */}
              <foreignObject x={loc.cx - 12} y={loc.cy - 28} width="24" height="24" className={cn("transition-all duration-300", activeLocation === loc.id ? "opacity-100 -translate-y-2" : "opacity-0")}>
                <div className="w-full h-full text-terracotta">
                  <MapPin className="w-6 h-6 fill-terracotta/20" />
                </div>
              </foreignObject>

              {/* Label */}
              <text 
                x={loc.cx} 
                y={loc.cy + 24} 
                textAnchor="middle" 
                className={cn(
                  "text-[12px] font-bold font-sans tracking-wide transition-all duration-300 fill-forest drop-shadow-md",
                  activeLocation === loc.id ? "opacity-100" : "opacity-70"
                )}
              >
                {loc.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Info Card Overlay */}
        <AnimatePresence>
          {activeLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-6 left-6 md:left-auto md:right-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/40 max-w-xs z-10 pointer-events-auto"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-terracotta/10 rounded-full flex items-center justify-center text-terracotta">
                  <Mountain className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-bold text-forest">{LOCATIONS.find(l => l.id === activeLocation)?.name}</h4>
              </div>
              <p className="text-sm text-forest/70 mb-5 font-medium leading-relaxed">
                {LOCATIONS.find(l => l.id === activeLocation)?.description}
              </p>
              <Link to={`/parvati-valley/${activeLocation}`}>
                <div className="inline-flex items-center justify-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-forest transition-colors shadow-lg group w-full">
                  Explore <Navigation className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
