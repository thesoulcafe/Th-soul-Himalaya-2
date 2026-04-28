import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const COSMIC_SECTIONS = [
  {
    id: "mantalai",
    title: "Parvati Mata Janma Bhoomi",
    subtitle: "The Source of the Divine River",
    image: "https://i.postimg.cc/63Qg07Xh/IMG-8098.jpg",
    paragraphs: [
      "While much of the valley is sacred, Mantalai Lake, situated at approximately 4,100 meters, holds a unique position as the source of the Parvati River and the legendary birthplace of the Goddess herself. Known as the Parvati Janma Bhoomi, Mantalai is a secluded glacial lake that serves as a site of pilgrimage for the most devout seekers.",
      "Local folklore suggests that the area surrounding the lake served as the homa kund (sacrificial fire pit) for the divine wedding of Shiva and Parvati. A small, ancient temple dedicated to Shiva as Aparneswar stands near the lake, containing idols of Parvati as a young girl (Kanya) alongside the divine couple and Lord Ganesha.",
      "The journey to Mantalai is viewed as a spiritual ascent, where the physical challenges of the trek mirror the internal rigors of the Goddess’s own penance."
    ],
    theme: "from-blue-900/20 to-black",
    icon: <Moon className="h-8 w-8 text-blue-300" />
  },
  {
    id: "manikaran",
    title: "Manikaran: The Sacred Convergence",
    subtitle: "The Boiling Waters of Legend",
    image: "https://i.postimg.cc/bJtyTF8k/IMG-8099.jpg",
    paragraphs: [
      "Manikaran, located on the right bank of the roaring Parvati River, is perhaps the most significant pilgrimage site in the region.",
      "For Hindus, the origin of the hot springs is tied to the Mani (jewel) legend. It is said that while Shiva and Parvati were residing in the valley, the Goddess lost a precious stone in the river. When Shiva’s attendants failed to find it, he opened his third eye in a rage that threatened to destroy the universe. To appease him, the serpent god Sheshnag hissed, causing boiling water to gush from the earth, bringing with it thousands of jewels. This pacified the deity and created the healing springs that define the town today."
    ],
    theme: "from-orange-900/20 to-black",
    icon: <Sun className="h-8 w-8 text-orange-300" />
  },
  {
    id: "kheerganga",
    title: "God Kartikey Meditation Spot",
    subtitle: "The Milky River of Knowledge",
    image: "https://images.unsplash.com/photo-1618572425332-29ada2e188a5?q=80&w=1530&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    paragraphs: [
      "Kheerganga, located at the end of a popular 13-kilometer trek from Barshaini, is a site of deep mythological significance. The name, which translates to \"the Ganges of Rice Pudding,\" refers to the legend of Kartikeya, the son of Shiva and Parvati, who chose this serene meadow for his long meditation.",
      "It is believed that Goddess Parvati, out of maternal love, created a stream of kheer (rice pudding) to sustain him. While the river is said to have turned into water in the current age of Kali Yuga, the greyish-white, milky appearance of the water persists, and the hot springs at the summit remain a primary draw for pilgrims.",
      "The act of bathing in these high-altitude springs is considered a ritual of rejuvenation, believed to cure ailments and cleanse the soul of worldly fatigue."
    ],
    theme: "from-emerald-900/20 to-black",
    icon: <Sparkles className="h-8 w-8 text-emerald-300" />
  }
];

const CosmicManifestation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050709] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111A22] via-[#050709] to-black text-white font-sans overflow-x-hidden selection:bg-terracotta/30">
      
      {/* Immersive Header */}
      <header className="relative pt-32 pb-24 px-6 text-center z-20">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-terracotta font-black uppercase tracking-[0.5em] text-xs mb-6"
        >
          The Sacred Topology
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-7xl font-playfair italic font-medium text-[#E8CCA6] tracking-wide"
        >
          A Cosmic Manifestation
        </motion.h1>
      </header>

      {/* Styled Cards Flow */}
      <div className="max-w-7xl mx-auto px-6 pb-32 space-y-32">
        {COSMIC_SECTIONS.map((section, index) => (
          <motion.section 
            key={section.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center relative`}
          >
            {/* Massive background number */}
            <div className={`absolute top-0 ${index % 2 === 1 ? 'right-0' : 'left-0'} -mt-20 opacity-5 pointer-events-none select-none text-[20rem] font-playfair italic font-bold text-white leading-none z-0`}>
              0{index + 1}
            </div>

            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative z-10">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 group">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] group-hover:scale-110"
                  style={{ backgroundImage: `url(${section.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${section.theme} mix-blend-multiply opacity-80`} />
                
                {/* Floating Icon Badge */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  {section.icon}
                </div>
              </div>
            </div>

            {/* Content Side with Glassmorphism Card */}
            <div className="w-full lg:w-1/2 relative z-20">
              <div className="relative rounded-[3rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 md:p-14 shadow-2xl overflow-hidden group">
                
                {/* Ethereal Glow Follow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
                
                <div className="relative z-10">
                  <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold mb-4">
                    {section.subtitle}
                  </p>
                  <h2 className="text-4xl md:text-5xl font-playfair text-[#E8CCA6] mb-8 leading-tight">
                    {section.title}
                  </h2>
                  
                  <div className="space-y-6">
                    {section.paragraphs.map((p, i) => (
                      <p key={i} className="text-white/70 font-sans text-base md:text-lg leading-relaxed font-light">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        ))}
      </div>
      
      {/* Journey End */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center pb-32"
      >
        <div className="w-px h-24 bg-gradient-to-b from-terracotta/50 to-transparent mx-auto mb-8" />
        <p className="text-white/40 font-playfair italic text-2xl">The Valley Awaits</p>
      </motion.div>
    </div>
  );
};

export default CosmicManifestation;
