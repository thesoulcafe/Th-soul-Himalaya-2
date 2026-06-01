import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { SEED_ARTICLES } from '../lib/seedData';
import { useAuth } from '../lib/AuthContext';

export const LatestArticlesSection = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'helmets_of_gods'), limit(10));
        const snap = await getDocs(q);
        let fetched = snap.docs.map(doc => doc.data());
        
        if (fetched.length === 0) {
          fetched = [...SEED_ARTICLES];
          
          if (profile?.role === 'admin') {
            // Only attempt to seed if the user is an admin to prevent permission errors
            for (const item of SEED_ARTICLES) {
              try {
                const articleData = { ...item, createdAt: new Date().toISOString() };
                await setDoc(doc(db, 'helmets_of_gods', item.slug), articleData);
              } catch (seedErr) {
                // Ignore seed error quietly 
              }
            }
          }
        }
        
        setArticles(fetched);
      } catch (error) {
        setArticles([...SEED_ARTICLES]);
      }
    };
    fetchArticles();
  }, [profile?.role]);

  if (articles.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-white/50 backdrop-blur-sm border-y border-forest/10 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-20">
          <div>
            <div className="flex items-center gap-2 text-terracotta font-black uppercase text-[10px] tracking-[0.3em] mb-4">
              <BookOpen className="h-4 w-4" />
              <span>Travel Narratives</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-extrabold text-forest leading-tight tracking-tight">
              Tales of the <br />Mountains
            </h2>
          </div>
          <Link 
            to="/parvati-valley" 
            className="group flex items-center justify-center gap-2 px-6 py-3 border-2 border-forest/20 rounded-full text-forest font-bold hover:bg-forest hover:text-white transition-all duration-300"
          >
            Explore the Valley
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20">
          {articles.map((article, index) => (
            <Link 
              key={index}
              to={`/helmets-of-gods/${article.slug}`}
              className="group block bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-forest/5 transition-all duration-300 hover:scale-[1.02]"
            >
              <h3 className="text-xl font-bold text-forest mb-3 line-clamp-2 group-hover:text-terracotta transition-colors">
                {article.title}
              </h3>
              <p className="text-sm font-medium text-forest/60 line-clamp-3 leading-relaxed">
                {article.metaDescription}
              </p>
              <div className="mt-6 flex items-center text-xs font-black uppercase tracking-widest text-terracotta">
                Read Article <span className="ml-2 transition-transform group-hover:translate-x-1"><ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
