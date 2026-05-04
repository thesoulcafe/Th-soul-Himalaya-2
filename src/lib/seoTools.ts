import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    // In Vite, environment variables are typically in import.meta.env
    // AI Studio provides GEMINI_API_KEY in the environment
    const key = (import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
    
    if (!key) {
      console.warn("GEMINI_API_KEY not found. AI-powered SEO tools will be limited.");
      return null;
    }
    aiClient = new GoogleGenAI(key);
  }
  return aiClient;
}

/**
 * Ensures a URL is absolute by prepending the domain if necessary.
 */
export function toAbsoluteUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const baseUrl = 'https://thesoulhimalaya.com';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Automate the generation of an SEO-optimized meta description using Gemini.
 */
export async function generateMetaDescription(pageContent: string, title: string): Promise<string> {
  try {
    const ai = getAI();
    if (!ai) return pageContent.slice(0, 160);

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(`You are an SEO expert. Write a compelling meta description (max 160 characters) for a travel page titled "${title}" with the following content: ${pageContent.slice(0, 500)}. Focus on benefits and search intent.`);
    
    return response.response.text()?.trim() || "";
  } catch (error) {
    console.error("AI Meta Description Generation failed:", error);
    return pageContent.slice(0, 160);
  }
}

/**
 * Generate JSON-LD Schema for different types.
 */
export function generateSchema(type: 'adventure' | 'cafe' | 'org', data: any) {
  const baseUrl = 'https://thesoulhimalaya.com';
  
  const org = {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "The Soul Himalaya",
    "url": baseUrl,
    "logo": toAbsoluteUrl("https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg"),
    "sameAs": ["https://www.instagram.com/thesoulhimalaya"]
  };

  if (type === 'org') return org;

  if (type === 'adventure') {
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": data.title,
      "description": data.description,
      "image": toAbsoluteUrl(data.image),
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
        "price": data.price?.replace(/[^0-9]/g, ''),
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": window.location.href
      }
    };
  }

  if (type === 'cafe') {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "The Soul Cafe",
      "image": toAbsoluteUrl("https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg"),
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
      "url": `${baseUrl}/soul-cafe`,
      "telephone": "+917878200632"
    };
  }
}
