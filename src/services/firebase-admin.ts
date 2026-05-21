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

// Determine if we have credentials to initialize Firestore:
// 1. In deployed environments (Firebase Cloud Functions, Cloud Run, App Hosting, Vercel etc.),
//    Google Application Default Credentials (ADC) are automatically provided.
// 2. In local environments, we require either GOOGLE_APPLICATION_CREDENTIALS or the Firestore Emulator.
const isDeployed = !!(
  process.env.FIREBASE_CONFIG ||
  process.env.K_SERVICE ||
  process.env.FUNCTION_NAME ||
  process.env.GAE_SERVICE ||
  process.env.VERCEL
);
const hasLocalCredentials = !!(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIRESTORE_EMULATOR_HOST
);

const shouldConnectToFirestore = isDeployed || hasLocalCredentials;

if (admin && shouldConnectToFirestore && !admin.apps.length) {
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
  if (!admin || !shouldConnectToFirestore || !admin.apps.length) {
    console.warn('Firebase Firestore is disabled (missing local credentials or emulator). Falling back to local overrides.');
    return null;
  }
  try {
    return admin.firestore();
  } catch (error) {
    console.warn('Firebase Firestore initialization failed, bypassing Firestore features:', error);
    return null;
  }
};

export const db = getFirestoreDb();


