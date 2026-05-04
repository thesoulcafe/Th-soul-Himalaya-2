import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toAbsoluteUrl } from '../lib/seoTools';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO = ({ title, description, keywords, canonicalUrl, image, type = 'website', articleData, trekData, cafeData }: SEOProps & { 
  image?: string, 
  type?: 'website' | 'article' | 'adventure' | 'cafe',
  articleData?: any,
  trekData?: any,
  cafeData?: any
}) => {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [pageSeo, setPageSeo] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'site_settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data());
      }
    }, (error) => {
      console.error("SEO site settings snapshot failed:", error);
    });

    // Fetch page-specific SEO
    const path = window.location.pathname;
    const fetchPageSeo = async () => {
      try {
        const q = query(collection(db, 'seo_settings'), where('path', '==', path));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPageSeo(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Failed to fetch page SEO:", err);
      }
    };
    fetchPageSeo();

    return () => unsubscribe();
  }, [window.location.pathname]);

  const seoTitle = pageSeo?.title || title;
  const seoDescription = pageSeo?.description || description;
  const seoImage = pageSeo?.ogImage || image || siteSettings?.globalOgImage || "https://i.postimg.cc/TYqctVvr/IMG-8144.jpg";

  const finalTitle = seoTitle.includes("Soul Himalaya") ? seoTitle : `${seoTitle} | Soul Himalaya`;
  
  // Automated Description Fallback (First 160 chars)
  const finalDescription = seoDescription && seoDescription.length > 10 
    ? seoDescription.slice(0, 160) 
    : "Discover curated retreats, high-altitude adventures, and artisan Himalayan crafts in Parvati Valley with The Soul Himalaya.";

  let finalImage = toAbsoluteUrl(seoImage);
  
  // Optimize unsplash images for WhatsApp/FB (1200x630, q=40 for size)
  if (finalImage.includes('unsplash.com')) {
    finalImage = finalImage.replace(/&w=\d+/, '&w=1200').replace(/&h=\d+/, '&h=630').replace(/&q=\d+/, '&q=40');
    if (!finalImage.includes('&h=')) finalImage += '&h=630';
    if (!finalImage.includes('&q=')) finalImage += '&q=40';
  }

  // Automated JSON-LD Generation
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${window.location.origin}/#organization`,
        "name": "The Soul Himalaya",
        "url": window.location.origin,
        "logo": "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg",
        "sameAs": ["https://www.instagram.com/thesoulhimalaya"]
      }
    ]
  };

  if (type === 'adventure' && trekData) {
    jsonLd["@graph"].push({
      "@type": "Event",
      "name": trekData.title,
      "description": trekData.description,
      "image": finalImage,
      "location": {
        "@type": "Place",
        "name": "Parvati Valley, Himalayas",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kasol",
          "addressRegion": "Himachal Pradesh",
          "addressCountry": "IN"
        }
      },
      "offers": {
        "@type": "Offer",
        "price": trekData.price?.replace(/[^0-9]/g, ''),
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    });
  }

  if (type === 'cafe' || cafeData) {
    jsonLd["@graph"].push({
      "@type": "LocalBusiness",
      "name": "The Soul Cafe",
      "image": "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Tosh Village",
        "addressLocality": "Tosh",
        "addressRegion": "Himachal Pradesh",
        "postalCode": "175105",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "32.0167",
        "longitude": "77.4500"
      },
      "url": `${window.location.origin}/soul-cafe`,
      "telephone": "+917878200632"
    });
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl || window.location.href} />
      
      {siteSettings?.googleSiteVerification && (
        <meta name="google-site-verification" content={siteSettings.googleSiteVerification} />
      )}
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl || window.location.href} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:site_name" content="The Soul Himalaya" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@soulhimalaya" />
    </Helmet>
  );
};
