import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  History, 
  Wind, 
  Mountain, 
  Droplets, 
  Shield, 
  Compass,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/button';

const HAMLET_DETAILS: Record<string, any> = {
  malana: {
    name: "Malana",
    tagline: "The Oldest Democracy in the World",
    icon: <Shield className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1595928898133-9354334e47f4?q=80&w=1740&auto=format&fit=crop",
    history: "Grounded in isolation, Malana is a social anomaly. The villagers believe they are descendants of Alexander the Great's soldiers. Their parliamentary system, governed by the edicts of Jamlu Devta, is ancient and unyielding.",
    experience: [
      { 
        title: "Taboo & Tradition", 
        desc: "Observation of the 'Kanashi' language and the unique social rules where touching outsiders is forbidden.",
        icon: <Shield />
      },
      { 
        title: "Jamlu Temple", 
        desc: "The sacred center of the village, where justice is served by the spirit of the deity.",
        icon: <History />
      },
      { 
        title: "High Altitude Terroir", 
        desc: "Understanding the unique geography that has protected this culture for millennia.",
        icon: <Mountain />
      }
    ],
    stats: [
      { label: "Elevation", value: "2,652m" },
      { label: "Ancestry", value: "Greek Roots" },
      { label: "Deity", value: "Jamlu Rishi" }
    ],
    color: "bg-terracotta"
  },
  tosh: {
    name: "Tosh",
    tagline: "Sentinel of the Pin Parvati Pass",
    icon: <Wind className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2000&auto=format&fit=crop",
    history: "Perched at the very end of the road, Tosh is the last bastion of civilization before the wild tundra of the high passes. It is a village of trekkers, dreamers, and those seeking the ultimate mountain solitude.",
    experience: [
      { 
        title: "Glacier Views", 
        desc: "Panoramic vistas of the Tosh Glacier and the snow-clad peaks of the Great Himalayas.",
        icon: <Mountain />
      },
      { 
        title: "Café Culture", 
        desc: "A melting pot of global travelers sharing stories over ginger lemon honey tea.",
        icon: <Zap />
      },
      { 
        title: "Gateway Trekking", 
        desc: "The starting point for the legendary Kutla meadows and the Pin Parvati crossing.",
        icon: <Compass />
      }
    ],
    stats: [
      { label: "Elevation", value: "2,400m" },
      { label: "Vibe", value: "High Alpine" },
      { label: "Key Access", value: "Tosh Glacier" }
    ],
    color: "bg-blue-600"
  },
  pulga: {
    name: "Pulga",
    tagline: "The Wooden Hive in the Fairy Forest",
    icon: <Mountain className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1643527311836-1b882311dbdb?q=80&w=1740&auto=format&fit=crop",
    history: "Hidden deep within a dense forest of deodar and pine, Pulga is a masterclass in slow living. Its traditional wooden architecture and the nearby 'Fairy Forest' create a sense of being inside a living myth.",
    experience: [
      { 
        title: "Fairy Forest", 
        desc: "Deep mossy groves where sunlight filters through ancient branches like liquid gold.",
        icon: <Sparkles />
      },
      { 
        title: "Kath-Kuni Craft", 
        desc: "Intricate wooden houses built without a single nail, standing for centuries.",
        icon: <History />
      },
      { 
        title: "Tea Gardens", 
        desc: "Lush clearings where local families harvest mountain herbs and wild flowers.",
        icon: <Droplets />
      }
    ],
    stats: [
      { label: "Elevation", value: "2,210m" },
      { label: "Forest Type", value: "Ancient Deodar" },
      { label: "Atmosphere", value: "Enchanted" }
    ],
    color: "bg-emerald-600"
  },
  kheerganga: {
    name: "Kheerganga",
    tagline: "The Spiritual Peak of Kartikeya",
    icon: <Droplets className="h-8 w-8" />,
    heroImage: "https://images.unsplash.com/photo-1618572425332-29ada2e188a5?q=80&w=1530&auto=format&fit=crop",
    history: "Accessible only by a steep 12km trek, Kheerganga is where the divine meets the earth. It is said Kartikeya, son of Shiva, meditated here, and the springs turned to 'Kheer' (milk) by his power.",
    experience: [
      { 
        title: "Ritual Bathing", 
        desc: "The natural hot springs offer a spiritual cleanse amidst sub-zero alpine air.",
        icon: <Droplets />
      },
      { 
        title: "Summit Silence", 
        desc: "A plateau at the edge of the world where the only sound is the wind in the peaks.",
        icon: <Mountain />
      },
      { 
        title: "Sacred Caves", 
        desc: "Quiet grottos where ascetics have sought enlightenment for generations.",
        icon: <History />
      }
    ],
    stats: [
      { label: "Elevation", value: "2,960m" },
      { label: "Trek Level", value: "Moderate" },
      { label: "Holy Site", value: "Kartikeya Cave" }
    ],
    color: "bg-indigo-600"
  }
};

export default function HamletDetail() {
  const { hamletId } = useParams<{ hamletId: string }>();
  const navigate = useNavigate();
  
  const data = useMemo(() => {
    if (!hamletId) return null;
    return HAMLET_DETAILS[hamletId.toLowerCase()];
  }, [hamletId]);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
        <h1 className="text-2xl font-bold text-forest mb-4">Hamlet Not Found</h1>
        <Button onClick={() => navigate('/parvati-valley')}>Return to Valley</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={data.heroImage} 
          alt={data.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-stone-50" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Link 
              to="/parvati-valley"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Back to Valley</span>
            </Link>
            
            <div className={`mx-auto w-16 h-16 ${data.color} rounded-2xl flex items-center justify-center text-white shadow-2xl mb-6`}>
              {data.icon}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white italic tracking-tighter drop-shadow-2xl">
              {data.name}
            </h1>
            
            <p className="text-white/90 text-xl font-playfair italic max-w-2xl mx-auto">
              {data.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Narrative & Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-forest/5"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <History className="h-6 w-6 text-terracotta" />
                <h2 className="text-3xl font-heading font-bold text-forest">Historical Lineage</h2>
              </div>
              
              <p className="text-lg text-forest/70 leading-relaxed font-medium first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-terracotta">
                {data.history}
              </p>

              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.experience.map((exp: any, i: number) => (
                  <div key={i} className="space-y-4 group">
                    <div className="h-12 w-12 rounded-xl bg-forest/5 flex items-center justify-center text-forest group-hover:bg-terracotta group-hover:text-white transition-all duration-300">
                      {React.cloneElement(exp.icon, { className: "h-6 w-6" })}
                    </div>
                    <h3 className="font-bold text-forest">{exp.title}</h3>
                    <p className="text-sm text-forest/60 leading-relaxed italic">
                      {exp.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-8"
          >
            <div className="bg-forest rounded-[2.5rem] p-10 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <MapPin className="h-6 w-6 text-terracotta" />
                <h3 className="font-bold tracking-tight uppercase text-xs tracking-[0.2em]">Village Vitals</h3>
              </div>
              
              <div className="space-y-6">
                {data.stats.map((stat: any, i: number) => (
                  <div key={i} className="flex flex-col border-b border-white/10 pb-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{stat.label}</span>
                    <span className="text-xl font-bold tracking-tight">{stat.value}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full mt-10 h-14 bg-white text-forest hover:bg-terracotta hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">
                <Link to="/tours?category=Adventure">Book Expedition</Link>
              </Button>
            </div>

            <div className="bg-terracotta/5 border border-terracotta/10 rounded-[2.5rem] p-8">
              <p className="text-xs text-terracotta font-bold uppercase tracking-widest mb-4">Traveler Tip</p>
              <p className="text-sm text-forest/60 italic leading-relaxed">
                "Respect local customs. In {data.name}, traditional laws are often prioritized over state laws. Always ask before taking photos of temples or villagers."
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
