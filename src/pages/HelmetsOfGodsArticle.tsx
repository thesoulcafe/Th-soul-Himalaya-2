import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { SEO } from '@/components/SEO';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SEED_ARTICLES } from '@/lib/seedData';

interface ArticleData {
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  slug: string;
  createdAt: string;
}

export default function HelmetsOfGodsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      try {
        setLoading(true);
        // Note: In Next.js this would happen in getStaticProps with revalidate: 60 (ISR)
        // Since we are using Vite (SPA/CSR) with Express, we fetch client-side.
        // Server-side meta tagging is handled via server.ts intercepting the route.
        const q = query(collection(db, 'helmets_of_gods'), where('slug', '==', slug));
        const snap = await getDocs(q);
        
        let foundArticle = null;
        if (!snap.empty) {
          foundArticle = snap.docs[0].data() as ArticleData;
        } else {
          // If not found in DB, fallback to seed data
          const fallback = SEED_ARTICLES.find(a => a.slug === slug);
          if (fallback) {
            foundArticle = { ...fallback, createdAt: new Date().toISOString() };
          }
        }
        setArticle(foundArticle);
      } catch (error) {
        console.error("Failed to fetch article:", error);
        // On permission error, fallback to seed data
        const fallback = SEED_ARTICLES.find(a => a.slug === slug);
        if (fallback) {
          setArticle({ ...fallback, createdAt: new Date().toISOString() });
        } else {
          setArticle(null);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-forest p-6 text-center">
        <h1 className="text-4xl font-heading font-black mb-4">Article Not Found</h1>
        <p className="text-lg text-forest/60 mb-8 max-w-md">The sacred scroll you are looking for has been hidden in the mists of the Parvati Valley.</p>
        <Link to="/" className="bg-terracotta text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-terracotta/90 transition-all shadow-xl">
          Return to the Valley
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 min-h-screen bg-cream text-forest overflow-hidden selection:bg-terracotta/20">
      <SEO 
        title={`${article.title} | Helmets of Gods | The Soul Himalaya`}
        description={article.metaDescription}
        keywords={article.keywords.join(", ")}
        type="article"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <Link to="/" className="inline-flex items-center text-terracotta font-bold text-xs uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-16 text-center"
        >
          <div className="inline-flex px-4 py-2 bg-terracotta/10 text-terracotta font-bold text-[10px] uppercase tracking-[0.2em] rounded-full">
            Helmets of Gods
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-montserrat font-extrabold text-forest tracking-tighter leading-tight drop-shadow-sm">
            {article.title}
          </h1>
        </motion.div>

        {/* Content Rendered Safely */}
        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg prose-forest max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-terracotta prose-img:rounded-3xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
}
