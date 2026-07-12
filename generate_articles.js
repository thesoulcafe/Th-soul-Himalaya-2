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

// Group keywords by 3-4
for (let i = 0; i < keywords.length; i += 3) {
  const targetKeywords = keywords.slice(i, i + 3);
  if (targetKeywords.length < 3 && i > 0) {
     targetKeywords.push(keywords[0]); // Pad if needed
  }
  
  const slug = targetKeywords[0].replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  
  let category = "General";
  if (targetKeywords.some(k => k.includes('hostel'))) category = "Hostels & Backpacking";
  else if (targetKeywords.some(k => k.includes('hotel'))) category = "Hotels & Luxury";
  else if (targetKeywords.some(k => k.includes('cafe') || k.includes('restaurant'))) category = "Cafes & Dining";
  else if (targetKeywords.some(k => k.includes('home stay') || k.includes('homestay') || k.includes('budget'))) category = "Homestays & Budget";
  else category = "Travel Guides";

  articles.push({
    id: `seo-article-${idCounter++}`,
    slug: slug + `-${idCounter}`,
    title: `Ultimate Guide to ${targetKeywords[0].replace(/\b\w/g, l => l.toUpperCase())} & More in 2026`,
    category,
    excerpt: `Planning a trip? Discover everything you need to know about ${targetKeywords.join(', ')}. Read our expert recommendations.`,
    keywords: targetKeywords,
    readTime: "4 min read",
    content: `
## Welcome to Parvati Valley

If you are searching for **${targetKeywords[0]}**, you have come to the right place. Parvati Valley is a mystical paradise located in Himachal Pradesh, known for its breathtaking landscapes, vibrant culture, and serene environment.

### Finding the Best Accommodations

When looking for **${targetKeywords[1]}**, it's essential to consider your budget, preferred location, and the kind of experience you want. Whether you're a solo backpacker or traveling with family, there are plenty of options available.

### Local Cuisine and Cafes

Don't miss out on the local culinary delights! Many visitors often ask about **${targetKeywords[2] || targetKeywords[0]}**. The cafes here not only offer delicious food but also provide stunning views of the snow-capped mountains. 

### Why Choose The Soul Cafe & Cottages?

At The Soul Cafe and Cottages, we offer a unique blend of comfort and nature. With our soulful ambiance and top-notch hospitality, your stay in the Himalayas will be truly unforgettable.

*Plan your trip today and immerse yourself in the soulful vibes of Himachal Pradesh.*
    `.trim()
  });
}

// Generate the TS file
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
