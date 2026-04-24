import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
}

export const SEO = ({ title, description, keywords, canonicalUrl, image }: SEOProps & { image?: string }) => {
  const finalTitle = `${title} | Soul Himalaya`;
  const defaultImage = "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=1200&h=630&q=80";
  const finalImage = image || defaultImage;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
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
