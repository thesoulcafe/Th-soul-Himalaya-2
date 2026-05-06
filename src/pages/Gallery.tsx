import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GalleryArchive from '@/components/GalleryArchive';

export default function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'content'), 
          where('type', '==', 'instagram'),
          orderBy('updatedAt', 'desc'), 
          limit(20)
        );
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            url: data.data.image || data.data.img,
            title: data.data.title || 'Soul Himalaya Artifact',
            description: data.data.description || 'A timeless capture of spiritual resonance.'
          };
        });
        
        if (fetchedPosts.length > 0) {
          setImages(fetchedPosts);
        }
      } catch (error) {
        console.error("Gallery Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
        >
          <Sparkles className="h-3 w-3" /> The Visual Manifest
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif text-neutral-900 tracking-tight"
        >
          Review <span className="italic text-[#A0522D]">Gallery</span>
        </motion.h1>
      </header>

      {/* Gallery Component */}
      <main>
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-neutral-100 border-t-[#A0522D] rounded-full animate-spin" />
          </div>
        ) : (
          <GalleryArchive images={images} propertyName="The Soul Himalaya" />
        )}
      </main>
    </div>
  );
}
