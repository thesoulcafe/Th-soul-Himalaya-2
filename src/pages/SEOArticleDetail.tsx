import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { seoArticlesData } from '../lib/seoArticlesData';
import Footer from '../components/Footer';

export default function SEOArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const article = seoArticlesData.find(a => a.slug === slug);

  useEffect(() => {
    if (!article) {
      navigate('/parvati-valley');
    }
    window.scrollTo(0, 0);
  }, [article, navigate]);

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Helmet>
        <title>{article.title} | The Soul Cafe & Cottages</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.keywords.join(', ')} />
        <link rel="canonical" href={`https://thesoulhimalaya.com/parvati-valley/guide/${article.slug}`} />
      </Helmet>

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/parvati-valley" 
            className="inline-flex items-center text-sm font-bold text-forest/60 hover:text-forest transition-colors mb-8 uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Parvati Valley
          </Link>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-forest/10 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
                {article.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-forest tracking-tight mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-forest/60 uppercase tracking-widest border-b border-forest/10 pb-8 mb-8">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {article.readTime}
              </div>
              <div className="flex items-center cursor-pointer hover:text-forest transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                Share Guide
              </div>
            </div>

            <div className="prose prose-lg prose-headings:font-bold prose-headings:text-forest prose-p:text-forest/80 prose-a:text-terracotta prose-a:no-underline hover:prose-a:underline max-w-none mb-12">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            <div className="bg-forest/[0.03] rounded-2xl p-6 border border-forest/5">
              <h3 className="text-sm font-bold text-forest flex items-center mb-4 uppercase tracking-widest">
                <Tag className="h-4 w-4 mr-2 text-terracotta" /> Tags & Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-bold uppercase tracking-widest text-forest/60 bg-white border border-forest/10 px-3 py-1.5 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
