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
import {
  connectAuthEmulator,
  getAuth,
  type Auth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

const requiredFirebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY?.trim() || null;
const useFirebaseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const firebaseEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST?.trim() || "127.0.0.1";

function emulatorPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
}

const firebaseEmulatorPorts = {
  auth: emulatorPort(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT, 9099),
  firestore: emulatorPort(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT, 8080),
  functions: emulatorPort(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT, 5001),
};

type FirebaseEnvKey = keyof typeof requiredFirebaseEnv;
type WellFitBrowserWindow = Window & {
  __wellfitFirebaseAppCheck?: AppCheck;
  __wellfitFirebaseEmulatorsConnected?: boolean;
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
  if (!firebaseApp || !appCheckSiteKey || typeof window === "undefined" || useFirebaseEmulators) return null;
  const browserWindow = window as WellFitBrowserWindow;
  if (browserWindow.__wellfitFirebaseAppCheck) return browserWindow.__wellfitFirebaseAppCheck;

  const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  browserWindow.__wellfitFirebaseAppCheck = appCheck;
  return appCheck;
}

function connectOptionalFirebaseEmulators(
  firebaseApp: FirebaseApp | null,
  authService: Auth,
  firestoreService: Firestore,
  functionsService: Functions,
): boolean {
  if (!firebaseApp || !useFirebaseEmulators || typeof window === "undefined") return false;
  const browserWindow = window as WellFitBrowserWindow;
  if (browserWindow.__wellfitFirebaseEmulatorsConnected) return true;

  connectAuthEmulator(
    authService,
    `http://${firebaseEmulatorHost}:${firebaseEmulatorPorts.auth}`,
    { disableWarnings: true },
  );
  connectFirestoreEmulator(
    firestoreService,
    firebaseEmulatorHost,
    firebaseEmulatorPorts.firestore,
  );
  connectFunctionsEmulator(
    functionsService,
    firebaseEmulatorHost,
    firebaseEmulatorPorts.functions,
  );
  browserWindow.__wellfitFirebaseEmulatorsConnected = true;
  return true;
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

export const functions: Functions = app
  ? getFunctions(app)
  : createUnavailableFirebaseService<Functions>("Functions");

export const firebaseEmulatorsConnected = connectOptionalFirebaseEmulators(
  app,
  auth,
  db,
  functions,
);
export const firebaseEmulatorMode = useFirebaseEmulators;
export const appCheck: AppCheck | null = initializeOptionalAppCheck(app);
export const appCheckClientConfigured = Boolean(app && appCheckSiteKey && !useFirebaseEmulators);
