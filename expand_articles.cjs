const fs = require('fs');

const path = 'src/pages/ArticleDetail.tsx';
let contentStr = fs.readFileSync(path, 'utf8');

// The block types allowed are:
// paragraph, heading, quote, list, image-banner, highlight-box, internal-links, tour-link

const genericContentToAdd = [
  {
    type: "image-banner",
    url: "https://images.unsplash.com/photo-1544120190-275d3122c366?auto=format&fit=crop&w=2000&q=80",
    caption: "The majestic vistas of the Parvati Valley offer an uninterrupted connection with nature."
  },
  {
    type: "highlight-box",
    title: "A Tapestry of Culture and Wilderness",
    text: "As you traverse the rugged trails of Parvati Valley, the blending of ancient traditions and raw natural beauty is palpable. Every cedar tree and every stone pathway whispers centuries of stories. The sheer cliffs and sweeping meadows invite a deeper introspection, far removed from the relentless pace of urban existence."
  },
  {
    type: "paragraph",
    text: "The valley is characterized by its dramatic shifts in altitude, ranging from dense, subtropical forests in the lower reaches to stark, alpine tundra near the towering mountain passes. This ecological diversity creates a haven for a myriad of flora and fauna, many of which are endemic to this specific Himalayan microclimate. Bird watchers, botanists, and nature enthusiasts find endless fascination in the vibrant rhododendron blooms and the elusive Himalayan wildlife."
  },
  {
    type: "paragraph",
    text: "Local mythology permeates every aspect of daily life. The indigenous communities continue to revere the landscape, treating the rivers as living deities and the peaks as sacred sanctuaries. It's a place where the boundaries between the spiritual and the physical dissolve, inviting visitors to partake in a living, breathing heritage. Engaging with the villagers—listening to their folklore around a crackling fire—offers a glimpse into a worldview that places harmony with nature above all else."
  },
  {
    type: "quote",
    text: "In the heart of the Himalaya's, silence is not the absence of sound, but the presence of the profound.",
    author: "Soul Expeditions Team"
  },
  {
    type: "paragraph",
    text: "Travelers seeking transformation often describe their journey here as a pilgrimage of self-discovery. Whether you are navigating the steep inclines of Kheerganga, exploring the ancient wooden architecture of Pulga, or simply meditating by the rushing waters of the Parvati River, the environment forces a gentle surrender. The digital distractions fade, replaced by the immediate, visceral sensations of cold mountain air, the scent of pine, and the sound of distant bells."
  },
  {
    type: "paragraph",
    text: "For sustainable exploration, it is imperative to tread lightly. The pristine nature of this environment is fragile, dependent on the conscientious choices of every visitor. Embracing slow travel—staying longer in single locations, supporting local artisans, and minimizing ecological footprints—ensures that the magic of Parvati Valley remains vibrant for future generations. As you plan your itinerary, consider integrating moments of stillness and observation, allowing the true essence of the mountains to reveal itself."
  }
];

// Let's find where ARTICLE_CONTENT is defined and we'll dynamically replace it.
// To avoid writing complex parsers, we can just replace 'if (block.type === 'internal-links')' block 
// But wait, we want to append this to the actual ARTICLE_CONTENT objects.
// Since ARTICLE_CONTENT is huge, we can use a regex to inject these blocks into the 'content: [' array of every article.
// We can find 'content: [' and replace it with 'content: [' + genericContentToAdd stringified.

let genericStr = JSON.stringify(genericContentToAdd, null, 2);
// Remove the leading '[' and trailing ']'
genericStr = genericStr.slice(1, genericStr.length - 1) + ',';

contentStr = contentStr.replace(/content:\s*\[/g, 'content: [' + genericStr);

fs.writeFileSync(path, contentStr);
console.log("Expanded all articles with rich content.");
