const admin = require('firebase-admin');
const path = require('path');

// Initialize with service account
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const uid = 'ArsdwD76YHMe6oM5fZ03lCdIMr52'; // replace with your actual UID

async function mergeEntriesIntoHealthData() {
  const userRef = db.collection('users').doc(uid);
  const entriesRef = userRef.collection('entries');
  const healthRef = userRef.collection('healthData');

  const [entriesSnap, healthSnap] = await Promise.all([
    entriesRef.get(),
    healthRef.get(),
  ]);

  const entryDates = new Set(entriesSnap.docs.map(doc => doc.id));

  const batch = db.batch();

  // Step 1: Copy all `entries` to `healthData`
  for (const doc of entriesSnap.docs) {
    const date = doc.id;
    const data = doc.data();
    const targetRef = healthRef.doc(date);
    batch.set(targetRef, data, { merge: false }); // Overwrite
  }

  // Step 2: (optional) Log dates in `healthData` not in `entries`
  const healthOnlyDates = healthSnap.docs
    .filter(doc => !entryDates.has(doc.id))
    .map(doc => doc.id);

  console.log('These dates exist only in healthData:', healthOnlyDates);

  await batch.commit();
  console.log('✅ Merge complete: entries -> healthData');
}

mergeEntriesIntoHealthData().catch(console.error); 