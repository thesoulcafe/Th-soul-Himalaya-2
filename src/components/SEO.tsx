import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO = ({ title, description, keywords, canonicalUrl, image }: SEOProps & { image?: string }) => {
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'site_settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data());
      }
    }, (error) => {
      console.error("SEO site settings snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const finalTitle = `${title} | Soul Himalaya`;
  const defaultImage = "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=1200&h=630&q=60";
  
  let finalImage = (title || "").toLowerCase().includes("valley of shadows")
    ? "https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"
    : (image || defaultImage);

  // Ensure absolute URL for images
  if (finalImage.startsWith('/')) {
    finalImage = `${window.location.origin}${finalImage}`;
  }
  
  // Optimize unsplash images for WhatsApp/FB (1200x630, q=60 for size)
  if (finalImage.includes('unsplash.com')) {
    finalImage = finalImage.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630').replace(/&q=\d+/, '&q=60');
    if (!finalImage.includes('&h=')) finalImage += '&h=630';
    if (!finalImage.includes('&q=')) finalImage += '&q=60';
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {siteSettings?.googleSiteVerification && (
        <meta name="google-site-verification" content={siteSettings.googleSiteVerification} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};
