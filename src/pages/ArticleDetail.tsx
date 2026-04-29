import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Calendar, 
  Share2, 
  BookOpen, 
  Wind,
  Star,
  Compass,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Enhanced Intelligence Database for 2026
const ARTICLE_CONTENT: Record<string, any> = {
  "tosh-guide-2026": {
    title: "The Ultimate Guide to Tosh Village (2026 Edition)",
    category: "Strategic Guide",
    readTime: "12 min read",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2000&auto=format&fit=crop",
    content: [
      {
        type: "paragraph",
        text: "Tosh in 2026 is no longer the hidden secret it was a decade ago, but it has retained its position as the sentinel of the Pin Parvati Pass. As the village evolves into a hub for digital nomads and serious high-altitude trekkers, understanding the new logistics is critical for a smooth journey."
      },
      {
        type: "heading",
        text: "The 2026 Infrastructure Upgrade"
      },
      {
        type: "paragraph",
        text: "Last year, the local Panchayat implemented a solar-powered path lighting grid, making evening walks to the higher cafes significantly safer. Additionally, a new fiber-optic corridor has brought stable 50Mbps internet to over 60% of the village, a revolution for those balancing work with wanderlust."
      },
      {
        type: "list",
        title: "Key Ground Updates",
        items: [
          "Road Connectivity: The shared taxi stand has moved 200m closer to the village gate.",
          "Waste Management: A mandatory 'Carry Back' policy for plastic is now strictly enforced at the Barshaini bridge.",
          "Regional Permits: No special permits are needed for Tosh, but keep your ID ready for the police check-post at Jari."
        ]
      },
      {
        type: "paragraph",
        text: "The vibe in Tosh remains distinct—a blend of high-alpine chill and spiritual resonance. The smell of cedar smoke in the evening remains the olfactory signature of this Himalayan sentinel."
      }
    ]
  },
  "malana-democracy": {
    title: "Malana: Decoding the World's Oldest Democracy",
    category: "Historical Study",
    readTime: "15 min read",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000&auto=format&fit=crop",
    content: [
      {
        type: "paragraph",
        text: "Malana stands apart from the rest of the world, not just geographically but through a social contract that has survived thousands of years. Known as the 'Oldest Democracy', its judicial system is governed by the edicts of Jamlu Devta, delivered through a chosen oracle."
      },
      {
        type: "heading",
        text: "The Edicts of Jamlu Devta"
      },
      {
        type: "paragraph",
        text: "In Malana, the law is simple: do not touch. Visitors are strictly prohibited from touching the walls, temples, or the inhabitants. This isn't just a cultural norm; it is an administrative requirement that maintains the 'purity' of the village lineage."
      },
      {
        type: "list",
        title: "Protocols for Visitors",
        items: [
          "Stay on the designated paths at all times.",
          "Payment should be placed on the ground or a counter, never handed over directly.",
          "Photography of the Upper Court (Parliament) building is strictly forbidden."
        ]
      }
    ]
  },
  "fairy-forest-pulga": {
    title: "The Fairy Forest: A Botanical & Spiritual Study",
    category: "Regional Wisdom",
    readTime: "8 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop",
    content: [
      {
        type: "paragraph",
        text: "The Fairy Forest in Pulga is an ancient deodar grove where the light filters through needles like liquid gold. It is a place of profound silence, favored by those seeking meditation or a reset from the digital noise of the cities."
      },
      {
        type: "paragraph",
        text: "The local legends speak of forest spirits that guard the roots of the giant trees. In 2026, the forest remains one of the few 'Silent Zones' where large groups are discouraged, preserving the acoustic sanctity of the woods."
      }
    ]
  },
  "kheerganga-legend": {
    title: "The Legend of Kartikeya: Sacred Peaks & Silence",
    category: "Spiritual Archive",
    readTime: "10 min read",
    date: "June 2026",
    image: "https://images.unsplash.com/photo-1618572425332-29ada2e188a5?q=80&w=2000&auto=format&fit=crop",
    content: [
      {
        type: "paragraph",
        text: "Kheerganga is more than just a destination; it is a pilgrimage site for the soul. According to local lore, Lord Shiva's son, Kartikeya, meditated in a cave here for thousands of years. It is said that Goddess Parvati made 'Kheer' (rice pudding) for him, and the white waters of the springs are a remnant of that divine meal."
      },
      {
        type: "heading",
        text: "The Kartikeya Cave"
      },
      {
        type: "paragraph",
        text: "While most visitors focus on the hot springs, the true spiritual heart of Kheerganga is the Kartikeya Cave, located a short climb above the plateau. The cave is managed by local ascetics who maintain a vow of partial silence."
      }
    ]
  },
  "hot-springs": {
    title: "Thermal Sanctity: The Science & Myth of the Springs",
    category: "Natural Science",
    readTime: "7 min read",
    date: "July 2026",
    image: "https://images.unsplash.com/photo-1544120190-275d3122c366?q=80&w=2000&auto=format&fit=crop",
    content: [
      {
        type: "paragraph",
        text: "The natural hot springs of Kheerganga are a geological marvel. Rich in sulfur and other minerals, these waters have been used for centuries to cure skin ailments and muscle exhaustion. In 2026, new ecological guidelines ensure that only natural, biodegradable products are allowed near the water sources."
      }
    ]
  }
};

export default function ArticleDetail() {
  const { hamletId, articleId } = useParams();
  const navigate = useNavigate();
  
  // Find article content
  const article = ARTICLE_CONTENT[articleId || ''] || ARTICLE_CONTENT["tosh-guide-2026"];

  return (
    <div className="min-h-screen bg-cream selection:bg-terracotta selection:text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-forest hover:bg-white/40 h-10 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {hamletId}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center p-0">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[70vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-terracotta text-white text-[10px] font-black uppercase tracking-widest"
            >
              <BookOpen className="h-3 w-3" /> {article.category}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-heading font-black text-forest italic tracking-tighter uppercase leading-[0.9]"
            >
              {article.title}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6 text-forest/50 text-[10px] font-black uppercase tracking-widest pt-4"
            >
              <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
              <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {article.date}</span>
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {hamletId}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-8 py-20">
        <div className="space-y-12">
          {article.content.map((block: any, index: number) => {
            if (block.type === 'paragraph') {
              return (
                <motion.p 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-xl md:text-2xl text-forest/80 leading-relaxed font-serif italic"
                >
                  {block.text}
                </motion.p>
              );
            }
            if (block.type === 'heading') {
              return (
                <motion.h2 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-heading font-black text-forest uppercase tracking-tighter"
                >
                  {block.text}
                </motion.h2>
              );
            }
            if (block.type === 'list') {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-forest/5 p-10 rounded-[3rem] border border-forest/5 space-y-6"
                >
                  <h3 className="text-xl font-heading font-bold text-forest uppercase tracking-widest">{block.title}</h3>
                  <ul className="space-y-4">
                    {block.items.map((item: string, i: number) => (
                      <li key={i} className="flex gap-4 text-forest/70 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            }
            return null;
          })}
        </div>

        {/* Strategic Footer */}
        <footer className="mt-40 pt-20 border-t border-forest/10">
          <div className="bg-forest rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-terracotta/20 rounded-full blur-[100px] -mr-20 -mt-20" />
            <div className="relative z-10 space-y-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Manifest Your Journey</span>
              <h3 className="text-4xl md:text-6xl font-heading font-black italic tracking-tighter leading-none">
                Ready to explore <br /> {hamletId}?
              </h3>
              <p className="text-white/60 max-w-xl font-medium">
                Our Soul Guides are ready to orchestrate your logical and spiritual flow. Book a curated expedition today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-white text-forest hover:bg-terracotta hover:text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                  <Link to="/booking">Check Availability</Link>
                </Button>
                <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                  <Link to="/tours">View All Tours</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 py-10 px-6 bg-stone-100 rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-forest flex items-center justify-center text-white">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Regional Intelligence</p>
                <p className="font-heading font-bold text-forest">The Soul Himalaya Research Hub</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/gallery" className="text-[10px] font-black uppercase tracking-widest text-forest/40 hover:text-terracotta transition-colors">Visual Archive</Link>
              <Link to="/guide" className="text-[10px] font-black uppercase tracking-widest text-forest/40 hover:text-terracotta transition-colors">Safety Protocols</Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
