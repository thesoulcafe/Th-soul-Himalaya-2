const fs = require('fs');

const keywords = [
  "hotels", "tosh, himachal pradesh", "hostels in tosh", "hotels in tosh", "tosh hostel", 
  "tosh hotel", "hostel in tosh", "tosh stays", "tosh hotel booking", "tosh hostels", 
  "stays in tosh", "stay in tosh", "the soul cafe and cottages, tosh, himachal pradesh", 
  "hotels in tosh himachal pradesh", "tosh stay", "2f94+784 the soul cafe and cottages, tosh, himachal pradesh",
  "best places to stay in tosh", "best stay in tosh", "best stays in tosh", "bhuntar, himachal pradesh",
  "book cafe in tosh", "budget stay in tosh", "cafe", "cafe in tosh", "cafe in tosh, himachal pradesh",
  "cheap homestay near satadhar himachal pradesh", "home stay in tosh", "home stay tosh", "hostel",
  "hostel tosh", "hotels in shanshar", "kasol, himachal pradesh", "khir ganga, himachal pradesh",
  "manali, himachal pradesh", "places to stay in tosh", "room in tosh", "soul", "soul cafe",
  "soul cafe tosh", "soulful himachal", "stay", "stay at tosh village", "stay in tosh himachal",
  "stay in tosh village", "stay options in tosh", "stays within 10kms", "the soul cafe and cottages, tosh, himachal pradesh, india",
  "the soul cafe and cottages, tosh, הימאצ'אל פרדש", "the soul cafe camps and cottages", "the soul stop bhuntar",
  "tosh", "tosh cafe", "tosh home stay", "tosh hotel price", "tosh hotel to stay", "tosh hotels",
  "tosh hotels price", "tosh places to stay", "tosh restaurant contact number", "tosh rooms",
  "tosh stay hostel", "tosh stay options", "tosh village hostel", "tosh, הימאצ'אל פרדש"
];

const articles = [];
let idCounter = 1;

for (let i = 0; i < keywords.length; i += 3) {
  const targetKeywords = keywords.slice(i, i + 3);
  if (targetKeywords.length < 3 && i > 0) {
     targetKeywords.push(keywords[0]);
  }
  
  const slug = targetKeywords[0].replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  
  let category = "General";
  if (targetKeywords.some(k => k.includes('hostel'))) category = "Hostels & Backpacking";
  else if (targetKeywords.some(k => k.includes('hotel'))) category = "Hotels & Luxury";
  else if (targetKeywords.some(k => k.includes('cafe') || k.includes('restaurant'))) category = "Cafes & Dining";
  else if (targetKeywords.some(k => k.includes('home stay') || k.includes('homestay') || k.includes('budget'))) category = "Homestays & Budget";
  else category = "Travel Guides";

  const titleCase = (str) => {
    const s = str.replace(/[^a-z0-9]+/gi, ' ').trim();
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  articles.push({
    id: `seo-article-${idCounter}`,
    slug: slug + `-${idCounter}`,
    title: `The Ultimate Guide: ${titleCase(targetKeywords[0])} & Beyond`,
    category,
    excerpt: `Planning a trip? Discover everything you need to know about ${targetKeywords.join(', ')}. Read our expert recommendations and plan your perfect mountain escape.`,
    keywords: targetKeywords,
    readTime: "4 min read",
    content: `
Are you planning your next mountain escape and searching for **${targetKeywords[0]}**? The majestic Parvati Valley in Himachal Pradesh is calling your name.

## Unveiling the Magic of the Himalayas

Nestled amidst towering peaks and lush greenery, this region is a haven for travelers seeking both peace and adventure. When considering **${targetKeywords[1]}**, it's crucial to find the right spot that resonates with your travel style. 

Whether you're looking for a vibrant backpacker community or a tranquil retreat away from the crowds, the choices are abundant.

## Recommendations and Tips

Many travelers frequently ask us about **${targetKeywords[2] || targetKeywords[0]}**. Based on our local expertise:
- Always book in advance during peak season (May to June).
- Experience the local cafe culture.
- Take short treks to nearby villages to truly absorb the soulful vibe of the valley.

### Why The Soul Cafe and Cottages?

For the ultimate experience, **The Soul Cafe and Cottages** in Tosh offers breathtaking views, cozy accommodations, and a vibrant community. It's the perfect basecamp for exploring all that the valley has to offer. 

Plan your journey today and find exactly what you're looking for!
    `.trim()
  });
  idCounter++;
}

const tsContent = `export interface SEOArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  keywords: string[];
  readTime: string;
  content: string;
}

export const seoArticlesData: SEOArticle[] = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync('src/lib/seoArticlesData.ts', tsContent);
console.log('Successfully generated src/lib/seoArticlesData.ts');
