import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, Tag } from 'lucide-react';
import { seoArticlesData } from '../lib/seoArticlesData';

export const SEOArticlesGrid = () => {
  // Group by category
  const groupedArticles = useMemo(() => {
    const groups: Record<string, typeof seoArticlesData> = {};
    seoArticlesData.forEach(article => {
      if (!groups[article.category]) {
        groups[article.category] = [];
      }
      groups[article.category].push(article);
    });
    return groups;
  }, []);

  return (
    <section className="py-24 px-4 bg-[#FDFBF7] relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 text-terracotta font-black uppercase text-[10px] tracking-[0.3em] justify-center w-full">
            <Book className="h-4 w-4" />
            <span>Travel Guides & Tips</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-extrabold text-forest leading-tight tracking-tight">
            Discover Tosh & Parvati Valley
          </h2>
          <p className="text-forest/60 max-w-2xl mx-auto text-lg">
            Plan your ultimate Himalayan getaway with our comprehensive guides covering stays, cafes, and local tips.
          </p>
        </div>

        <div className="space-y-16 relative z-20">
          {Object.entries(groupedArticles).map(([category, articles]) => (
            <div key={category} className="space-y-8">
              <h3 className="text-2xl font-bold text-forest border-b border-forest/10 pb-4 flex items-center">
                {category}
                <span className="ml-4 text-xs font-black uppercase tracking-widest text-forest/40 bg-forest/5 px-3 py-1 rounded-full">
                  {articles.length} Guides
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <Link 
                    key={index}
                    to={`/parvati-valley/guide/${article.slug}`}
                    className="group flex flex-col bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl border border-forest/5 transition-all duration-300 hover:-translate-y-1 h-full"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.keywords.slice(0, 2).map((kw, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-widest text-forest/40 bg-forest/5 px-2 py-1 rounded-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                    
                    <h4 className="text-xl font-bold text-forest mb-3 leading-snug group-hover:text-terracotta transition-colors flex-grow">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm font-medium text-forest/60 line-clamp-3 leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-forest/5 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forest/40">
                        {article.readTime}
                      </span>
                      <div className="flex items-center text-xs font-black uppercase tracking-widest text-terracotta">
                        Read <span className="ml-2 transition-transform group-hover:translate-x-1"><ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
