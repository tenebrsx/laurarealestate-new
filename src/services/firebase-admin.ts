// Safe dynamic loading of firebase-admin to bypass static bundler (Webpack/Turbopack)
// issues in serverless and Cloud Function environments.
const getFirebaseAdmin = () => {
  try {
    // Using eval to hide the require from static analysis bundlers
    return eval("require('firebase-admin')");
  } catch (error) {
    console.warn("Dynamic require of 'firebase-admin' failed, using fallback:", error);
    return null;
  }
};

const admin = getFirebaseAdmin();

// Determine the active Firebase project ID, fallback to the default production ID
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'laura-realestate';

if (admin && !admin.apps.length) {
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
  if (!admin || !admin.apps.length) return null;
  try {
    return admin.firestore();
  } catch (error) {
    console.warn('Firebase Firestore initialization failed, bypassing Firestore features:', error);
    return null;
  }
};

export const db = getFirestoreDb();

