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
    backgroundImage: "https://i.postimg.cc/TYqctVvr/IMG-8144.jpg", // Mantra Lake representation
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
            className="relative rounded-[2.5rem] md:rounded-[3rem] min-h-[350px] sm:min-h-[450px] flex items-center justify-center overflow-hidden bg-[#0c0603] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="https://i.postimg.cc/TYqctVvr/IMG-8144.jpg" 
                alt="Shiva Shakti Background" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 group-hover/cosmic:scale-100 transition-transform duration-[6s]"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Centered Divine Motif */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative h-64 w-64 md:h-96 md:w-96 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center animate-[spin_20s_linear_infinite]">
                 {/* Visual energy rings */}
                 <div className="absolute inset-4 rounded-full border border-terracotta/10" />
                 <div className="absolute inset-8 rounded-full border border-[#4A7FA5]/10" />
              </div>
            </div>

            {/* Glass Content Plate */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-16">
              <div className="max-w-3xl w-full space-y-8 text-center backdrop-blur-md bg-black/20 p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex justify-center gap-4 mb-2">
                    <div className="h-px w-8 bg-white/20 self-center" />
                    <span className="text-terracotta text-[10px] font-black uppercase tracking-[0.5em] drop-shadow-sm">Divine Union</span>
                    <div className="h-px w-8 bg-white/20 self-center" />
                  </div>

                  <h2 className="font-playfair text-4xl xs:text-5xl md:text-7xl lg:text-8xl text-white font-black italic tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase text-wrap">
                    Shiva Shakti
                  </h2>

                  <div className="flex items-center justify-center gap-2 text-white/40 uppercase tracking-[0.2em] text-[8px] font-bold">
                    <span>Masculline</span>
                    <div className="h-1 w-1 rounded-full bg-terracotta" />
                    <span>Feminine</span>
                  </div>
                </motion.div>

                <p className="font-playfair italic text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                  "Where the silent meditation of Shiva meets the vibrant dance of Parvati—discover the eternal balance in the shadows of the cedars."
                </p>

                <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                  <div className="relative px-8 py-4 rounded-full bg-white text-forest font-black uppercase tracking-[0.25em] text-[10px] flex items-center gap-4 group/btn overflow-hidden transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                    <span className="relative z-10">Experience the Cosmic</span>
                    <ArrowRight className="relative z-10 h-4 w-4 group-hover/btn:translate-x-2 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-terracotta scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500" />
                    <span className="absolute inset-0 bg-terracotta opacity-0 group-hover/btn:opacity-100" />
                    <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300" />
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

      {/* 3. Interactive Village Grid (The Hamlets of the Gods) */}
      <section className="py-24 bg-forest border-y border-white/5 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />

        <div className="px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">The Hamlets of the Gods</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto uppercase tracking-widest font-black text-xs">Four Pillars of the Parvati Experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pageData.villages.map((village, idx) => (
              <Link 
                to={`/parvati-valley/${village.name.toLowerCase()}`}
                key={village.name} 
                className="block group h-[500px] relative rounded-[2rem] overflow-hidden border border-white/10"
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
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                        {village.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-terracotta transition-colors">{village.name}</h3>
                      <p className="text-white/60 text-sm mb-4 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                        {village.history}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-terracotta font-black text-xs tracking-widest uppercase py-1 px-3 rounded-full bg-white/5 backdrop-blur-md self-start">
                          {village.vibe}
                        </span>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                          <div className="px-6 py-2.5 rounded-full bg-white text-terracotta text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-terracotta hover:text-white transition-colors cursor-pointer">
                            <span>View</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
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

      {/* 3. Material Culture (Beautiful Card) */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden bg-white p-10 md:p-16 shadow-2xl border border-forest/5"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest tracking-tight leading-tight mb-4">
                The Architecture of Resilience
              </h2>
              <p className="text-forest/60 text-lg font-medium">
                Analysis of the indigenous Kath-Kuni techniques that define the valley's architectural heritage.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pageData.materialCulture.comparison.map((row) => (
                <div key={row.feature} className="p-8 rounded-[2rem] bg-stone-50 border border-forest/10 hover:shadow-xl hover:border-forest/20 transition-all duration-500 group flex flex-col h-full bg-gradient-to-b from-stone-50 to-white">
                  <h3 className="font-bold text-forest text-xl mb-6 flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-terracotta shrink-0 shadow-sm shadow-terracotta/30" />
                    {row.feature}
                  </h3>
                  <div className="space-y-4 flex-grow flex flex-col">
                    <div className="p-8 rounded-2xl bg-forest text-white flex-1 flex flex-col shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">Indigenous Kath-Kuni</p>
                      <p className="text-sm font-medium leading-relaxed">{row.kathKuni}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
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
