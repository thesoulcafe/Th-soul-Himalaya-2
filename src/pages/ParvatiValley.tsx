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
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Content JSON Structure
const PARVATI_DATA = {
  hero: {
    headline: "The Valley of Shadows & Light",
    subheadline: "A Spiritual Odyssey through the heart of the Kullu Himalayas",
    backgroundImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2670&auto=format&fit=crop", // Mantalai Lake representation
    parallaxIntensity: 0.5
  },
  narrative: {
    title: "The Eternal Dance of Ardhanarishvara",
    content: "In the silken mists that rise from the Parvati river, one does not merely find a waterway, but the physical manifestation of Shakti herself. The river takes its name from the consort of Lord Shiva, who is said to have meditated for three thousand years in these high glens. It is here that the concept of Ardhanarishvara—the divine union of masculine and feminine principles—becomes visceral. The hot springs of Manikaran, bubbling with primordial energy, are whispered to be the result of a divine Mani (jewel) lost by the Goddess and returned with the hiss of the underworld's heat. To walk the valley is to walk between the shadows of cedar forests and the blinding light of the Great Himalayan summits.",
    imageDescription: "An evocative illustration of Lord Shiva and Parvati as Ardhanarishvara, one half ethereal blue (Shiva), the other vibrant orange-pink (Parvati), merging into each other against a background of snow-capped Himalayan peaks and mossy pines."
  },
  villages: [
    {
      name: "Malana",
      history: "Known as the oldest democracy in the world, the Malanese believe themselves to be direct descendants of Alexander the Great's soldiers. Their social structure is governed strictly by the edicts of Jamlu Devta.",
      vibe: "#AncientDemocracy",
      icon: <Shield className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1595928898133-9354334e47f4?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Tosh",
      history: "A village that clings to the edges of the mountainside at 2,400m. It serves as the ultimate gateway to the Pin Parvati Pass, standing as a sentinel between the forest and the tundra.",
      vibe: "#HippieHideaway",
      icon: <Wind className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Pulga",
      history: "Famed for its 'Fairy Forest', Pulga is a masterclass in traditional wooden housing. The architecture here tells stories of centuries spent in isolation, perfecting the art of timber framing.",
      vibe: "#TheWoodenHive",
      icon: <Mountain className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1643527311836-1b882311dbdb?q=80&w=1200&auto=format&fit=crop"
    },
    {
      name: "Kheerganga",
      history: "The site where Kartikeya, the god of war and son of Shiva, is said to have meditated. The milky-white waters of the hot springs remain a site of ritual purification for spiritual seekers.",
      vibe: "#SpiritualPeak",
      icon: <Droplets className="h-5 w-5" />,
      image: "https://images.unsplash.com/photo-1528319725582-ddc096101511?q=80&w=1200&auto=format&fit=crop"
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
      {/* 1. Cosmic Ardhnarishwar */}
      <section className="px-6 max-w-4xl mx-auto mb-16 relative">
        <Link to="/cosmic-manifestation" className="block relative group/cosmic cursor-pointer overflow-visible">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative rounded-[2.5rem] min-h-[380px] flex items-center justify-center overflow-hidden bg-[#0a0502] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/5"
          >
            {/* Immersive Atmospheric Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 opacity-40 mix-blend-screen transition-transform duration-[4s] group-hover/cosmic:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2670&auto=format&fit=crop')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Layered Cosmic Glows */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.45, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-terracotta/30 rounded-full blur-[80px] mix-blend-soft-light" 
              />
              <motion.div 
                animate={{ 
                  scale: [1.15, 1, 1.15],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#4A7FA5]/20 rounded-full blur-[100px] mix-blend-screen" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
            </div>

            {/* Glass Container for Content */}
            <div className="relative z-10 w-full px-6 py-10 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Divine Symbol */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-terracotta blur-xl opacity-20 animate-pulse" />
                    <div className="relative h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl flex text-terracotta shadow-2xl">
                      <Mountain className="h-6 w-6 stroke-[1.5]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-terracotta/80 text-[8px] font-black uppercase tracking-[0.4em] block mb-1">A Spiritual Odyssey</span>
                  <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white tracking-tighter leading-none" style={{ textShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>
                    Ardhnarishwar
                  </h2>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <p className="font-playfair italic text-base md:text-lg leading-relaxed text-white/90 text-center px-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontWeight: 400 }}>
                    "The Parvati Valley is inextricably linked to the cosmic relationship between Lord Shiva, the supreme ascetic and destroyer, and Goddess Parvati."
                  </p>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button variant="ghost" className="h-auto py-2.5 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 group-hover/cosmic:border-terracotta/50 transition-all duration-500">
                    <span className="text-terracotta text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                      Delve Deeper
                      <ArrowRight className="h-3.5 w-3.5 group-hover/cosmic:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* 2. Interactive Village Grid (The Hamlets of the Gods) */}
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
              <motion.div
                key={village.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group h-[500px] relative rounded-[2rem] overflow-hidden border border-white/10"
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
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white shadow-xl">
                      {village.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{village.name}</h3>
                    <p className="text-white/60 text-sm mb-4 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                      {village.history}
                    </p>
                    <span className="text-terracotta font-black text-xs tracking-widest uppercase py-1 px-3 rounded-full bg-white/5 backdrop-blur-md self-start">
                      {village.vibe}
                    </span>
                  </div>
                </div>
              </motion.div>
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
