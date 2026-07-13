import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, where, setDoc, doc, addDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

const articles = [
  {
    title: "Jamlu Devta of Malana: The Helmet of Justice",
    slug: "jamlu-devta-malana",
    metaDescription: "Discover the enigmatic Jamlu Devta of Malana village in Parvati Valley, exploring the ancient laws, spiritual helmets, and untouchable traditions of this secluded Himalayan community.",
    content: "<h2>The Enigma of Malana</h2><p>Malana is known as the oldest functioning democracy in the world, governed by the strict tenets of their chief deity, Jamlu Devta. According to local lore, Jamlu forms the spiritual helmet of the valley, a guardian of justice and righteousness.</p><h2>The Laws of the Protector</h2><p>Visitors to Malana must adhere strictly to the rules laid out by the village council, acting on behalf of Jamlu. Touching the temple walls or the villagers without absolute consent draws heavy spiritual and financial penalties. The deity's power is absolute, protecting the village from outside cultural corrosion.</p>",
    keywords: ["Jamlu Devta", "Malana", "Parvati Valley myths", "Himalayan gods"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Shringi Rishi: The Guardian of Banjar",
    slug: "shringi-rishi-guardian",
    metaDescription: "Unveil the legends of Shringi Rishi, the presiding deity of the Banjar region. Learn about his historical significance, the sacred Chehni Kothi, and the helmet of spiritual defense he provides.",
    content: "<h2>The Tower of Chehni Kothi</h2><p>Standing tall in the Banjar valley is Chehni Kothi, dedicated to Shringi Rishi. As one of the principal deities of the region, Shringi Rishi played a pivotal role in the Ramayana, performing the Putrakameshti Yagna for King Dasharatha.</p><h2>The Spiritual Helmet of Banjar</h2><p>Locals believe that Shringi Rishi casts a protective helmet over the valley, shielding its inhabitants from natural disasters and evil spirits. The architectural marvel of his temple stands as a testament to the deep-rooted faith of the Himachali people.</p>",
    keywords: ["Shringi Rishi", "Chehni Kothi", "Banjar valley", "Himachal gods"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Bijli Mahadev: The Lightning Catcher",
    slug: "bijli-mahadev-lightning",
    metaDescription: "Explore the fascinating phenomenon of Bijli Mahadev temple in Kullu Valley, where lightning shatters the Shiva lingam, only to be pieced back together by the temple priest with butter.",
    content: "<h2>The Divine Conductor</h2><p>Perched high in the Kullu Valley, Bijli Mahadev is a temple where divine energy literally strikes the earth. The tall staff atop the temple acts as a conductor, drawing lightning which shatters the sacred Shiva lingam.</p><h2>The Helmet of Restoration</h2><p>The miracle lies in the restoration. The priest meticulously pieces the lingam together using a paste of butter and sattoo. This act symbolizes destruction and rebirth, the ultimate helmet of resilience that Shiva offers to the universe.</p>",
    keywords: ["Bijli Mahadev", "Kullu Valley", "Shiva temple", "Himalayan miracles"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Hidimba Devi: The Demoness Turned Goddess",
    slug: "hidimba-devi-manali",
    metaDescription: "Delve into the story of Hidimba Devi, a character from the Mahabharata who transformed from a demoness into a revered goddess, providing the spiritual helmet for Manali.",
    content: "<h2>From the Mahabharata to Manali</h2><p>Hidimba Devi's transformation is a powerful tale of redemption and devotion. Originally a Rakshasi, her marriage to Bhima and her subsequent penance led to her elevation as the chief deity of Manali.</p><h2>The Wooden Pagoda</h2><p>Her temple, a stunning multi-tiered wooden pagoda set among towering deodars, serves as a sanctuary. She wears the spiritual helmet of motherhood, protecting the region and serving as the focal point of the famous Kullu Dussehra festival.</p>",
    keywords: ["Hidimba Devi", "Manali temple", "Mahabharata", "Himachal mythology"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Vashisht & The Hot Springs",
    slug: "vashisht-hot-springs",
    metaDescription: "Learn about Sage Vashisht, the guru of Lord Rama, and the miraculous hot springs named after him that provide healing and spiritual cleansing in the Himalayas.",
    content: "<h2>The Legend of Sage Vashisht</h2><p>According to legend, Sage Vashisht, heartbroken by the death of his sons, tried to end his life in the river Vipasha (Beas). The river refused to drown him, instead breaking his bonds.</p><h2>The Healing Helmet</h2><p>The village of Vashisht stands where he meditated. The sulfur hot springs here are considered therapeutic, a healing helmet provided by the sage's enduring spiritual energy. Travelers seek these waters for physical and spiritual rejuvenation.</p>",
    keywords: ["Vashisht", "hot springs", "sage Vashisht", "healing waters"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Parashar Rishi: The Lake of the Sage",
    slug: "parashar-rishi-lake",
    metaDescription: "Journey to Parashar Lake, named after the ancient sage Parashar who meditated here. Discover the mysterious floating island and the pagoda-style temple.",
    content: "<h2>The Meditation Site of Parashar</h2><p>High above the Mandi valley sits Parashar Lake, a body of water with extraordinary depth and a mysterious floating island. It is here that Sage Parashar is said to have meditated.</p><h2>The Architect's Helmet</h2><p>The three-tiered pagoda temple beside the lake is an architectural gem. The legend states it was built by a six-month-old baby from a single tree. The sage's presence provides a subtle helmet of peace and wisdom over the entire region.</p>",
    keywords: ["Parashar Lake", "Parashar Rishi", "floating island", "Mandi valley"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Shikari Devi: The Roofless Goddess",
    slug: "shikari-devi-roofless",
    metaDescription: "Uncover the mystery of Shikari Devi, the goddess whose temple stands without a roof, yet never accumulates snow during the harsh Himalayan winters.",
    content: "<h2>The Shrine Without a Roof</h2><p>Located in the Mandi district, Shikari Devi temple is unique—it has no roof. Despite the heavy snowfall in the region, snow never accumulates directly on the idols.</p><h2>The Helmet of the Wild</h2><p>She is the goddess of the hunters, providing safe passage and success in the wilderness. Her open-air shrine signifies that her helmet of protection encompasses the entire sky, refusing to be constrained by walls or ceilings.</p>",
    keywords: ["Shikari Devi", "roofless temple", "Mandi district", "Himalayan mysteries"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Manu Rishi: The Creator's Abode in Manali",
    slug: "manu-rishi-manali",
    metaDescription: "Learn about Manu Rishi, the progenitor of humanity according to Hindu mythology, and his historical connection to the town of Manali.",
    content: "<h2>The Genesis of Humanity</h2><p>Manali literally translates to 'the abode of Manu'. After the great flood, Manu is said to have stepped off his ark in this very valley to recreate human life.</p><h2>The Helmet of Creation</h2><p>The Manu Temple in old Manali stands as a tribute to the creator. The spiritual helmet he provides is foundational, representing the continuous cycle of destruction and the enduring power of creation in the Himalayan ethos.</p>",
    keywords: ["Manu Rishi", "Manali history", "Hindu mythology", "creator of humanity"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Bhagsu Nag: The Serpent Deity of Dharamshala",
    slug: "bhagsu-nag-serpent",
    metaDescription: "Explore the legend of Bhagsu Nag, the serpent deity whose conflict and subsequent truce with King Bhagsu created the famous waterfall and temple in Dharamshala.",
    content: "<h2>The Battle for Water</h2><p>The legend tells of King Bhagsu, who stole water from the sacred Dal Lake (owned by the serpent god Nag) for his drought-stricken kingdom. A battle ensued, resulting in the king's defeat, but the Nag god granted the water to the people.</p><h2>The Helmet of Sustenance</h2><p>The Bhagsu Nag temple and its adjacent waterfall are symbols of this truce. The serpent deity provides a helmet of sustenance and water prosperity for the region, revered by both locals and visiting travelers.</p>",
    keywords: ["Bhagsu Nag", "Dharamshala", "serpent deity", "Bhagsu waterfall"],
    createdAt: new Date().toISOString()
  },
  {
    title: "Kamakhya Devi of Polian: The Shakti Manifest",
    slug: "kamakhya-devi-polian",
    metaDescription: "Discover the Kamakhya Devi temple in Polian, Una, a lesser-known but deeply revered Shakti Peeth in Himachal Pradesh, representing primal feminine power.",
    content: "<h2>The Pindar Shakti</h2><p>While the most famous Kamakhya temple is in Assam, Polian in Una district holds its own profound significance. The temple is dedicated to the goddess in her Pindar form, representing the origin of existence.</p><h2>The Helmet of the Mother</h2><p>Worshippers flock here seeking the ultimate protective helmet of the Mother Goddess. She is the source of all energy (Shakti), fiercely protective of her devotees and capable of removing the deepest of spiritual obstacles.</p>",
    keywords: ["Kamakhya Devi", "Polian", "Shakti Peeth", "Una district"],
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  for (const item of articles) {
    const q = query(collection(db, 'helmets_of_gods'), where('slug', '==', item.slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'helmets_of_gods', querySnapshot.docs[0].id);
      await setDoc(docRef, item, { merge: true });
      console.log(`Updated: ${item.title}`);
    } else {
      await addDoc(collection(db, 'helmets_of_gods'), item);
      console.log(`Created: ${item.title}`);
    }
  }
  console.log("Done seeding Helmets of Gods articles.");
  process.exit(0);
}

seed().catch(console.error);
