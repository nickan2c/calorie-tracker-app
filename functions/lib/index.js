"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestHealthDataToFirebaseAcc = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const v2_1 = require("firebase-functions/v2");
(0, v2_1.setGlobalOptions)({ region: 'europe-west1' });
admin.initializeApp();
const db = admin.firestore();
var AppleHealthType;
(function (AppleHealthType) {
    AppleHealthType["ACTIVE_ENERGY"] = "Active Energy";
    AppleHealthType["DIETARY_CALORIES"] = "Dietary Calories";
    AppleHealthType["PROTEIN"] = "Protein";
    AppleHealthType["STEPS"] = "Steps";
    AppleHealthType["WEIGHT"] = "Weight";
})(AppleHealthType || (AppleHealthType = {}));
const DEFAULT_VALUES = {
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
exports.ingestHealthDataToFirebaseAcc = functions
    .https.onRequest(async (req, res) => {
    var _a;
    try {
        const { uid, token, data } = req.body;
        if (!uid || !token || !Array.isArray(data)) {
            res.status(400).json({ error: "Missing uid, token or data" });
            return;
        }
        // Verify token
        const userDoc = await db.collection("users").doc(uid).get();
        const storedToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.writeToken;
        if (!storedToken || storedToken !== token) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
        // Group data by normalized date
        const grouped = {};
        for (const sample of data) {
            const normalizedDate = new Date(sample.date).toISOString().slice(0, 10);
            const num = parseFloat(sample.value);
            if (!grouped[normalizedDate]) {
                grouped[normalizedDate] = Object.assign(Object.assign({}, DEFAULT_VALUES), { date: normalizedDate });
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
    }
    catch (error) {
        console.error('Error processing health data:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=index.js.map