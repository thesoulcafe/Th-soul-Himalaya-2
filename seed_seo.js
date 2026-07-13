import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, where, setDoc, doc, addDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

const defaultImage = "https://i.postimg.cc/wMSWmFKB/IMG-1095.webp";

const seoData = [
  {
    path: "/",
    keyword: "Tour Package Himachal Pardesh, trekking in Parvati valley",
    title: "Soul Himalaya: Trekking & Yoga in Parvati Valley Tosh",
    description: "Experience the ultimate adventure and spiritual growth with our trekking, yoga, and meditation packages in Tosh and breathtaking Parvati Valley, Himachal.",
    ogImage: defaultImage
  },
  {
    path: "/tours",
    keyword: "Tour Package Himachal Pardesh, corporate Tour packages",
    title: "Exclusive Tour Package Himachal Pradesh - Soul Himalaya",
    description: "Discover our exclusive tour package Himachal Pradesh offering sustainable tourism, local culture explorations, and mesmerizing adventures in Parvati Valley.",
    ogImage: defaultImage
  },
  {
    path: "/trekks",
    keyword: "trekking in Parvati valley, trekking in Tosh, high-altitude trekking",
    title: "High Altitude Trekking in Parvati Valley & Tosh",
    description: "Join our expert guides for high-altitude trekking in Parvati Valley and Tosh. Discover breathtaking trails, snow-capped peaks, and unforgettable adventures.",
    ogImage: defaultImage
  },
  {
    path: "/yoga",
    keyword: "yoga packages, yoga retreats Parvati Valley",
    title: "Transformative Yoga Retreat Packages in Parvati Valley",
    description: "Immerse yourself in serenity with our transformative yoga packages in the Himalayas. Rejuvenate your mind, body, and soul amidst the peaks of Parvati Valley.",
    ogImage: defaultImage
  },
  {
    path: "/meditation",
    keyword: "meditation packages, mindfulness Tosh",
    title: "Peaceful Meditation Packages in Tosh, Himachal Pradesh",
    description: "Find inner peace with our soulful meditation packages in Tosh. Experience mindfulness in the tranquil environment of the Himalayas to completely rejuvenate.",
    ogImage: defaultImage
  },
  {
    path: "/wfh",
    keyword: "wfh in Parvati valley, remote work mountains",
    title: "Work From Mountains & WFH in Parvati Valley, Tosh",
    description: "Upgrade your remote lifestyle with our WFH in Parvati Valley packages. Enjoy high-speed internet, comfortable stays, and stunning mountain views in Tosh.",
    ogImage: defaultImage
  },
  {
    path: "/parvati-valley",
    keyword: "Parvati Valley, Tosh, adventures",
    title: "Explore Parvati Valley: Kasol, Tosh & Trekking Trails",
    description: "Explore the magic of Parvati Valley. Uncover hidden waterfalls, ancient temples, and vibrant culture. Plan your ultimate adventure and high-altitude trekking.",
    ogImage: defaultImage
  },
  {
    path: "/soul-cafe",
    keyword: "Soul Cafe Tosh, Parvati Valley food",
    title: "The Soul Cafe Tosh: Best Food & Vibes in Parvati Valley",
    description: "Visit The Soul Cafe in Tosh for a soulful culinary experience. Relish delicious food, stunning mountain views, and the best hospitality in Parvati Valley.",
    ogImage: defaultImage
  },
  {
    path: "/about",
    keyword: "sustainable tourism Parvati Valley, Soul Himalaya",
    title: "About Soul Himalaya: Sustainable Tourism in Himachal",
    description: "Learn about The Soul Himalaya's commitment to sustainable tourism, local community support, and providing unforgettable adventures in Tosh and Parvati.",
    ogImage: defaultImage
  },
  {
    path: "/contact",
    keyword: "Contact Soul Himalaya, book trekking",
    title: "Contact Soul Himalaya for Trekking & Tour Packages",
    description: "Get in touch with The Soul Himalaya to book your next tour package, corporate retreat, or trekking adventure in the majestic landscapes of Himachal Pradesh.",
    ogImage: defaultImage
  }
];

async function seed() {
  for (const item of seoData) {
    const q = query(collection(db, 'seo_settings'), where('path', '==', item.path));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing
      const docRef = doc(db, 'seo_settings', querySnapshot.docs[0].id);
      await setDoc(docRef, { ...item, updatedAt: new Date() }, { merge: true });
      console.log(`Updated: ${item.path}`);
    } else {
      // Create new
      await addDoc(collection(db, 'seo_settings'), { ...item, updatedAt: new Date(), createdAt: new Date() });
      console.log(`Created: ${item.path}`);
    }
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch(console.error);
