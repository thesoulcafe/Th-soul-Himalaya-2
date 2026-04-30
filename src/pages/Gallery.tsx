import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Instagram, ExternalLink, ArrowLeft, Camera, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES = [
  { id: 'all', label: 'All Artifacts' },
  { id: 'landscape', label: 'Landscapes' },
  { id: 'culture', label: 'Culture' },
  { id: 'expeditions', label: 'Expeditions' },
];

export default function Gallery() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // We fetch from the 'content' collection where type is 'instagram'
        const q = query(
          collection(db, 'content'), 
          where('type', '==', 'instagram'),
          orderBy('updatedAt', 'desc'), 
          limit(50)
        );
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data.data, // Admin saves actual post data inside a 'data' field
            timestamp: data.updatedAt 
          };
        });
        
        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
        } else {
          // Fallback static data if firestore is empty
          setPosts([
            { id: 1, image: 'https://images.unsplash.com/photo-1598335624134-4067980cdb24', url: 'https://instagram.com', category: 'landscape' },
            { id: 2, image: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc2140', url: 'https://instagram.com', category: 'culture' },
            { id: 3, image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', url: 'https://instagram.com', category: 'expeditions' },
            { id: 4, image: 'https://images.unsplash.com/photo-1544120190-275d3122c366', url: 'https://instagram.com', category: 'landscape' },
            { id: 5, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', url: 'https://instagram.com', category: 'culture' },
          ]);
        }
      } catch (error) {
        console.error("Gallery Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-cream selection:bg-terracotta selection:text-white pb-20">
      {/* Navigation - Hidden per request */}
      <div className="pt-20" />

      {/* Header */}
      <header className="pt-40 px-6 max-w-7xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 text-forest/40 text-[10px] font-black uppercase tracking-widest"
            >
              <Sparkles className="h-3 w-3" /> The Visual Manifest
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-heading font-black text-forest italic tracking-tighter uppercase leading-[0.8]"
            >
              Gallery <br /> <span className="text-terracotta">Archive</span>
            </motion.h1>
            <Button 
              variant="outline" 
              className="mt-8 border-forest text-forest rounded-full h-12 px-8 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group"
              onClick={() => window.open('https://www.instagram.com/thesoulhimalaya', '_blank')}
            >
              <Instagram className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Follow on Instagram
            </Button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-forest/10 border-t-terracotta rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id || i}
                layoutId={`gallery-item-${post.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-forest/5 shadow-2xl shadow-forest/5 cursor-pointer"
              >
                <img 
                  src={post.image || post.img} 
                  alt="Gallery Artifact" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="h-3 w-3" /> Parvati Valley
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-heading font-black italic uppercase tracking-tighter text-xl">The Soul Capture</h4>
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full bg-white text-forest flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-40 text-center px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="h-px w-20 bg-terracotta mx-auto" />
          <h2 className="text-3xl font-heading font-bold text-forest italic tracking-tight">
            Infinite frames of spiritual resonance.
          </h2>
          <Button 
            className="rounded-xl h-14 px-10 bg-forest text-white hover:bg-terracotta transition-colors font-black uppercase tracking-widest text-[11px]"
            onClick={() => window.open('https://instagram.com/thesoulhimalaya', '_blank')}
          >
            Live Feed @thesoulhimalaya
          </Button>
        </div>
      </footer>
    </div>
  );
}
