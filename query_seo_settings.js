import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, 'seo_settings'));
  let matched = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.path && (data.path.includes("osh") || data.path.includes("alana") || data.path.includes("asol") || data.path.includes("anali"))) {
      matched.push(`${doc.id} => ${data.path}`);
    }
  });
  console.log(matched.join("\n"));
  process.exit(0);
}
run();
