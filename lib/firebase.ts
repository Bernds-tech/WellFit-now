import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const requiredFirebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY?.trim() || null;

type FirebaseEnvKey = keyof typeof requiredFirebaseEnv;
type WellFitBrowserWindow = Window & {
  __wellfitFirebaseAppCheck?: AppCheck;
};

const missingFirebaseEnv = (
  Object.entries(requiredFirebaseEnv) as [FirebaseEnvKey, string | undefined][]
)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const missingFirebaseEnvMessage = `Missing Firebase environment variables: ${missingFirebaseEnv.join(
  ", ",
)}`;

function createUnavailableFirebaseService<T extends object>(serviceName: string): T {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") return undefined;
        throw new Error(
          `${missingFirebaseEnvMessage}. Cannot use Firebase ${serviceName} until all NEXT_PUBLIC_FIREBASE_* variables are configured.`,
        );
      },
      set() {
        throw new Error(
          `${missingFirebaseEnvMessage}. Cannot use Firebase ${serviceName} until all NEXT_PUBLIC_FIREBASE_* variables are configured.`,
        );
      },
    },
  ) as T;
}

function getFirebaseConfig(): FirebaseOptions | null {
  if (missingFirebaseEnv.length > 0) return null;
  return {
    apiKey: requiredFirebaseEnv.apiKey,
    authDomain: requiredFirebaseEnv.authDomain,
    projectId: requiredFirebaseEnv.projectId,
    storageBucket: requiredFirebaseEnv.storageBucket,
    messagingSenderId: requiredFirebaseEnv.messagingSenderId,
    appId: requiredFirebaseEnv.appId,
  };
}

function initializeOptionalAppCheck(firebaseApp: FirebaseApp | null): AppCheck | null {
  if (!firebaseApp || !appCheckSiteKey || typeof window === "undefined") return null;
  const browserWindow = window as WellFitBrowserWindow;
  if (browserWindow.__wellfitFirebaseAppCheck) return browserWindow.__wellfitFirebaseAppCheck;

  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  browserWindow.__wellfitFirebaseAppCheck = appCheck;
  return appCheck;
}

const firebaseConfig = getFirebaseConfig();
const app = firebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth: Auth = app
  ? getAuth(app)
  : createUnavailableFirebaseService<Auth>("Auth");

export const db: Firestore = app
  ? getFirestore(app)
  : createUnavailableFirebaseService<Firestore>("Firestore");

export const appCheck: AppCheck | null = initializeOptionalAppCheck(app);
export const appCheckClientConfigured = Boolean(app && appCheckSiteKey);
