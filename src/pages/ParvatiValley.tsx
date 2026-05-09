import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mountain, 
  MapPin, 
  History, 
  Shield, 
  Thermometer, 
  Wind, 
  ArrowRight,
  Sun,
  Droplets,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Content JSON Structure
const PARVATI_DATA = {
  hero: {
    headline: "The Valley of Shadows and Light",
    subheadline: "A Spiritual Odyssey through the heart of the Kullu Himalayas",
    backgroundImage: "https://images.unsplash.com/photo-1544333323-167bb3098522?auto=format&fit=crop&w=1200&h=630&q=80", // Mantra Lake representation
    parallaxIntensity: 0.5
  },
  narrative: {
    title: "The Eternal Dance of Shiva Shakti",
    content: "In the silken mists that rise from the Parvati river, one does not merely find a waterway, but the physical manifestation of Shakti herself. The river takes its name from the consort of Lord Shiva, who is said to have meditated for three thousand years in these high glens. It is here that the concept of Shiva Shakti—the divine union of masculine and feminine principles—becomes visceral. The hot springs of Manikaran, bubbling with primordial energy, are whispered to be the result of a divine Mani (jewel) lost by the Goddess and returned with the hiss of the underworld's heat. To walk the valley is to walk between the shadows of cedar forests and the blinding light of the Great Himalayan summits.",
    imageDescription: "An evocative illustration of Lord Shiva and Parvati as Shiva Shakti, one half ethereal blue (Shiva), the other vibrant orange-pink (Parvati), merging into each other against a background of snow-capped Himalayan peaks and mossy pines."
  },
  villages: [
    {
      name: "Malana",
      history: "Known as the oldest democracy in the world, the Malanese believe themselves to be direct descendants of Alexander the Great's soldiers. Their social structure is governed strictly by the edicts of Jamlu Devta.",
      vibe: "#AncientDemocracy",
      icon: <Shield className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1595928898133-9354334e47f4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Tosh",
      history: "A village that clings to the edges of the mountainside at 2,400m. It serves as the ultimate gateway to the Pin Parvati Pass, standing as a sentinel between the forest and the tundra.",
      vibe: "#HippieHideaway",
      icon: <Wind className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2000&auto=format&fit=crop"
    },
    {
      name: "Pulga",
      history: "Famed for its 'Fairy Forest', Pulga is a masterclass in traditional wooden housing. The architecture here tells stories of centuries spent in isolation, perfecting the art of timber framing.",
      vibe: "#TheWoodenHive",
      icon: <Mountain className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1643527311836-1b882311dbdb?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Kheerganga",
      history: "The site where Kartikeya, the god of war and son of Shiva, is said to have meditated. The milky-white waters of the hot springs remain a site of ritual purification for spiritual seekers.",
      vibe: "#SpiritualPeak",
      icon: <Droplets className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1618572425332-29ada2e188a5?q=80&w=1530&auto=format&fit=crop"
    }
  ],
  materialCulture: {
    comparison: [
      {
        feature: "Seismic Resilience",
        kathKuni: "Exceptional flexibility due to alternate layers of dry-stacked stone and deodar wood."
      },
      {
        feature: "Thermal Insulation",
        kathKuni: "Natural cavity walls and wood thickness provide superior warmth in sub-zero winters."
      },
      {
        feature: "Historical Lineage",
        kathKuni: "Traditional 'Kulluvi' identity; uses local, sustainable materials (Stone/Timber)."
      }
    ]
  }
};

const ParvatiValley = () => {
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'page_parvati'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAdminData(snapshot.docs[0].data().data);
      }
    }, (error) => {
      console.error("Parvati Valley snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const pageData = useMemo(() => {
    const data: any = { ...PARVATI_DATA };
    if (adminData) {
      if (adminData.image) data.hero.backgroundImage = adminData.image;
      if (adminData.narrativeImage) data.narrative.imageOverride = adminData.narrativeImage;
      if (adminData.malanaImage) data.villages[0].image = adminData.malanaImage;
      if (adminData.toshImage) data.villages[1].image = adminData.toshImage;
      if (adminData.pulgaImage) data.villages[2].image = adminData.pulgaImage;
      if (adminData.kheergangaImage) data.villages[3].image = adminData.kheergangaImage;
      if (adminData.images && Array.isArray(adminData.images)) data.gallery = adminData.images;
    }
    return data;
  }, [adminData]);

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-terracotta/20 font-sans overflow-x-hidden pt-24">
      {/* 1. Cosmic Shiva Shakti Card - Enhanced Visuals */}
      <section className="px-6 max-w-5xl mx-auto mb-20 relative">
        <Link to="/cosmic-manifestation" className="block relative group/cosmic cursor-pointer">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-forest shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col"
          >
            {/* Image Container */}
            <div className="relative h-[300px] sm:h-[450px] overflow-hidden bg-forest/80 flex items-center justify-center">
              {/* Centered Divine Motif */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative h-48 w-48 md:h-80 md:w-80 rounded-full border border-white/10 bg-white/[0.05] flex items-center justify-center animate-[spin_20s_linear_infinite]">
                   <div className="absolute inset-4 rounded-full border border-terracotta/20" />
                   <div className="absolute inset-8 rounded-full border border-[#4A7FA5]/20" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent opacity-60" />
            </div>

            {/* Content Plate - Below Image */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center p-8 md:p-12 bg-forest text-white">
              <div className="max-w-3xl w-full space-y-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex justify-center gap-4 mb-2">
                    <div className="h-px w-12 bg-white/40 self-center" />
                    <span className="text-terracotta text-[12px] font-black uppercase tracking-[0.5em] drop-shadow-md">Divine Union</span>
                    <div className="h-px w-12 bg-white/40 self-center" />
                  </div>

                  <h2 className="font-playfair text-5xl xs:text-6xl md:text-8xl text-white font-black italic tracking-tighter uppercase">
                    Shiva Shakti
                  </h2>

                  <div className="flex items-center justify-center gap-4 text-white/60 uppercase tracking-[0.3em] text-[10px] font-bold">
                    <span>Masculine</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                    <span>Feminine</span>
                  </div>
                </motion.div>

                <p className="font-playfair italic text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                  "Where the silent meditation of Shiva meets the vibrant dance of Parvati—discover the eternal balance in the shadows of the cedars."
                </p>

                <motion.div whileHover={{ scale: 1.05 }} className="inline-block mt-4">
                  <div className="relative px-10 py-4 rounded-full bg-terracotta text-white font-black uppercase tracking-[0.25em] text-[11px] flex items-center gap-4 group/btn overflow-hidden transition-all shadow-xl">
                    <span className="relative z-10">Experience the Cosmic</span>
                    <ArrowRight className="relative z-10 h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* New: Divine Duality Card (Shiva Meditation & Sikh Reverence) */}
      <section className="px-6 max-w-5xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] bg-forest/5 border border-forest/10 p-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="h-8 w-8 text-forest/10 group-hover:text-terracotta/20 transition-colors" />
            </div>
            <div className="relative z-10 space-y-4">
              <span className="text-terracotta text-[10px] font-black uppercase tracking-widest">Ancient Penance</span>
              <h3 className="text-3xl font-playfair italic font-bold text-forest">The 3,000 Year Meditation</h3>
              <p className="text-sm text-forest/60 leading-relaxed font-medium">
                It is whispered that Lord Shiva himself chose this high alpine sanctuary for his intense dhyana (meditation), which lasted three millennia. This profound spiritual energy is what gives the Parvati Valley its legendary aura and makes it a site where the veil between the physical and divine worlds is remarkably thin.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] bg-white border border-forest/5 shadow-xl shadow-forest/5 overflow-hidden flex flex-col"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1675515642414-d99b23e2d95f?q=80&w=1035&auto=format&fit=crop" 
                alt="Manikaran Sahib Gurudwara"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
              <div className="absolute top-0 right-0 p-6">
                <History className="h-8 w-8 text-white group-hover:text-amber-400 transition-colors drop-shadow-lg" />
              </div>
            </div>
            <div className="relative z-10 space-y-4 p-10 flex-1">
              <span className="text-blue-500/60 text-[10px] font-black uppercase tracking-widest">Sikh Heritage</span>
              <h3 className="text-3xl font-playfair italic font-bold text-forest">The Miracle of Manikaran</h3>
              <p className="text-[13px] text-forest/70 leading-relaxed font-medium">
                Sikh community holds Manikaran in equal reverence, associating it with a 16th-century visit by Guru Nanak Dev Ji and his disciple Bhai Mardana. When Mardana found himself without fire to cook chapatis, Guru Nanak directed him to lift a stone, revealing a hot spring. Today, the Manikaran Sahib Gurudwara continues this legacy by cooking the daily langar directly in the boiling spring water—a living testament to the equality and selfless service central to Sikhism.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Interactive Village Grid (The Hamlets of Parvati valley) */}
      <section className="py-24 bg-forest border-y border-white/5 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />

        <div className="px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">The Hamlets of Parvati valley</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto uppercase tracking-widest font-black text-xs">Four Pillars of the Parvati Experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageData.villages.map((village, idx) => (
              <Link 
                to={`/parvati-valley/${village.name.toLowerCase()}`}
                key={village.name} 
                className="block group h-[500px] relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full w-full"
                >
                  {/* Real Image of the Place */}
                  <img 
                    src={village.image} 
                    alt={village.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                        {village.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-terracotta transition-colors">{village.name}</h3>
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-4 transition-all duration-500">
                        {village.history}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-terracotta font-black text-[10px] tracking-widest uppercase py-1.5 px-3 rounded-full bg-white/10 backdrop-blur-md">
                          {village.vibe}
                        </span>
                        
                        <div className="px-5 py-2 rounded-full bg-terracotta text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(217,119,87,0.3)] group-hover:bg-white group-hover:text-terracotta transition-all duration-300">
                          <span>Explore</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Material Culture (Redesigned: The Blueprint of Life) */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-white relative rounded-[4rem] my-24 shadow-2xl overflow-hidden">
        {/* Architectural Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2d3e35 1px, transparent 1px), linear-gradient(90deg, #2d3e35 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-black uppercase tracking-[0.3em]">
                <Sparkles className="h-3 w-3" /> Technical Heritage
              </div>
              <h2 className="text-4xl md:text-7xl font-playfair font-black italic text-forest tracking-tighter leading-none">
                The Heritage <br />of Survival
              </h2>
              <p className="text-forest/60 text-lg font-medium leading-relaxed">
                Kath-Kuni is not just a style; it's a thousand-year-old biological code for architecture—perfected for a valley that breathes with seismic energy.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-5xl font-playfair italic font-black text-forest/5 leading-none">ESTD. 1200 AD</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Seismic Flex",
                desc: "The 'Kath' (timber) and 'Kuni' (corner) technique allows the structure to shift up to 10cm during a tremor without structural failure.",
                icon: Shield
              },
              {
                title: "Solar Ritual",
                desc: "South-facing timber balconies act as heat traps, absorbing the fierce Himalayan sun to keep core rooms 15°C warmer than the gale outside.",
                icon: Sun
              },
              {
                title: "Wind Logic",
                desc: "Steep-pitched slate roofs are engineered to shed 3 feet of snow in a single morning, preventing roof-collapse in extreme winter.",
                icon: Wind
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-forest/5 p-8 rounded-[2.5rem] border border-forest/10 group hover:bg-forest transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:bg-terracotta transition-colors shadow-sm">
                  <item.icon className="h-7 w-7 text-terracotta group-hover:text-white transition-colors" />
                </div>
                <h5 className="text-2xl font-bold text-forest group-hover:text-white transition-colors mb-4">{item.title}</h5>
                <p className="text-forest/60 text-sm font-medium leading-relaxed group-hover:text-white/70 transition-colors">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer-like Funnel */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-8">Ready to witness the shadows and light?</h2>
        <Button asChild className="bg-forest text-white h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-forest/20 hover:scale-105 transition-transform">
          <Link to="/tours?category=Adventure">View Parvati Expeditions</Link>
        </Button>
      </section>
    </div>
  );
};

export default ParvatiValley;
