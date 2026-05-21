import * as admin from 'firebase-admin';

// Determine the active Firebase project ID, fallback to the default production ID
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'laura-realestate';

if (!admin.apps.length) {
  try {
    // In local environments, passing an explicit projectId allows admin.firestore() to initialize
    // without throwing a crash-inducing "Unable to detect a Project Id" module-load error.
    admin.initializeApp({
      projectId: projectId
    });
    console.log(`Firebase Admin initialized with project: ${projectId}`);
  } catch (error) {
    console.warn('Firebase Admin default initialization failed:', error);
  }
}

// Gracefully handle Firestore initialization errors on module load
const getFirestoreDb = () => {
  if (!admin.apps.length) return null;
  try {
    return admin.firestore();
  } catch (error) {
    console.warn('Firebase Firestore initialization failed, bypassing Firestore features:', error);
    return null;
  }
};

export const db = getFirestoreDb();

