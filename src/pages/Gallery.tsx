import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GalleryArchive from '@/components/GalleryArchive';
import HeroSection from '@/components/HeroSection';
import { SEO } from '@/components/SEO';

export default function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    });
    return () => unsubscribe();
  }, []);

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
      {seo && <SEO title={seo.title} description={seo.description} keywords={seo.keyword} />}
      
      {/* Dynamic Hero Header */}
      <HeroSection
        backgroundImage={seo?.heroImage}
        height="h-[60vh] min-h-[400px]"
        subtitle="The Visual Manifest"
        title={
          <>
            Gallery <span className="italic text-terracotta font-playfair">Archive</span>
          </>
        }
        description="A timeless collection of spiritual resonance and Himalayan beauty."
        overlayClassName="bg-gradient-to-b from-black/60 via-transparent to-white"
        fallbackImage="https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=1920&q=80"
      />

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
