import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: 'europe-west1' });

admin.initializeApp();

const db = admin.firestore();

enum AppleHealthType {
  ACTIVE_ENERGY = "Active Energy",
  DIETARY_CALORIES = "Dietary Calories",
  PROTEIN = "Protein",
  STEPS = "Steps",
  WEIGHT = "Weight"
}

interface HealthDataSample {
  date: string;
  type: AppleHealthType;
  value: string;
}

interface DailyEntry {
  date: string;
  cardio: number;
  deficit: number;
  exercise1: string;
  exercise2: string;
  intake: number;
  notes: string;
  protein: number;
  steps: number;
  weight: number;
}

const DEFAULT_VALUES: Partial<DailyEntry> = {
  cardio: 0,
  deficit: 0,
  exercise1: "",
  exercise2: "",
  intake: 0,
  notes: "",
  protein: 0,
  steps: 0,
  weight: 0
};

export const ingestHealthDataToFirebaseAcc = functions
.https.onRequest(async (req, res) => {
    try {
      const { uid, token, data } = req.body;

      if (!uid || !token || !Array.isArray(data)) {
        res.status(400).json({ error: "Missing uid, token or data" });
        return;
      }

      // Verify token
      const userDoc = await db.collection("users").doc(uid).get();
      const storedToken = userDoc.data()?.writeToken;

      if (!storedToken || storedToken !== token) {
        res.status(403).json({ error: "Invalid token" });
        return;
      }

      // Group data by normalized date
      const grouped: Record<string, Partial<DailyEntry>> = {};
      
      for (const sample of data as HealthDataSample[]) {
        const normalizedDate = new Date(sample.date).toISOString().slice(0, 10);
        const num = parseFloat(sample.value);
        
        if (!grouped[normalizedDate]) {
          grouped[normalizedDate] = {
            ...DEFAULT_VALUES,
            date: normalizedDate
          };
        }

        // Map Apple Health types to our fields
        switch (sample.type) {
          case AppleHealthType.DIETARY_CALORIES:
            grouped[normalizedDate].intake = Math.round(num * 100) / 100;
            break;
          case AppleHealthType.STEPS:
            grouped[normalizedDate].steps = Math.round(num * 100) / 100;
            break;
          case AppleHealthType.WEIGHT:
            grouped[normalizedDate].weight = Math.round(num * 100) / 100;
            break;
          case AppleHealthType.PROTEIN:
            grouped[normalizedDate].protein = Math.round(num * 100) / 100;
            break;
        }
      }

      // Batch write
      const batch = db.batch();
      for (const [date, entry] of Object.entries(grouped)) {
        const ref = db.collection("users").doc(uid).collection("healthData").doc(date);
        batch.set(ref, entry, { merge: true });
      }

      await batch.commit();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing health data:', error);
      res.status(500).json({ error: "Internal server error" });
    }
});
