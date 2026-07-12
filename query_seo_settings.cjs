const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

initializeApp({
  projectId: config.projectId,
  credential: applicationDefault()
});

const db = getFirestore(config.firestoreDatabaseId);

async function run() {
  const snapshot = await db.collection('seo_settings').get();
  console.log("Total docs:", snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.path && data.path.includes(" stays")) {
       // just print
    }
    if (data.path && (data.path.includes("osh") || data.path.includes("alana"))) {
      console.log(data.path);
    }
  });
}
run();
