import { db } from '../firebaseConfig/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

export const saveEntry = async (userId, entry) => {
  const userEntriesRef = collection(db, "users", userId, "healthData");
  await setDoc(doc(userEntriesRef, entry.date), entry);
};

export const deleteEntry = async (userId, date) => {
  const userEntryRef = doc(db, "users", userId, "healthData", date);
  await deleteDoc(userEntryRef);
};

export const fetchEntries = async (userId) => {
  const userEntriesRef = collection(db, "users", userId, "healthData");
  const snapshot = await getDocs(userEntriesRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const saveUserSettings = async (userId, settings) => {
  const userSettingsRef = doc(db, "users", userId, "settings", "goals");
  await setDoc(userSettingsRef, settings);
};

export const fetchUserSettings = async (userId) => {
  const userSettingsRef = doc(db, "users", userId, "settings", "goals");
  const doc = await getDocs(userSettingsRef);
  return doc.data();
}; 