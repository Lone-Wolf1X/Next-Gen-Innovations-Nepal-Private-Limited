// =========================================================
// GyanBazi — Firebase Configuration
// Project: nextgen-learn-2c351
// =========================================================

// Firebase SDK (v9 compat mode for easier CDN usage)
const firebaseConfig = {
  apiKey: "AIzaSyAfZ3oSHIkXytaHRsT0VInYm8weQUz2lkM",
  authDomain: "nextgen-learn-2c351.firebaseapp.com",
  projectId: "nextgen-learn-2c351",
  storageBucket: "nextgen-learn-2c351.firebasestorage.app",
  messagingSenderId: "917024364153",
  appId: "1:917024364153:web:c970eae3617ff181a466a8"
};

// Initialize Firebase (compat SDK loaded via CDN in HTML)
firebase.initializeApp(firebaseConfig);

// Export services for use across files
const auth = firebase.auth();
const db   = firebase.firestore();

// ─── Platform Config ─────────────────────────────────────
const NGL_CONFIG = {
  PLATFORM_NAME:    'GyanBazi',
  PLATFORM_SHORT:   'NGL',
  POWERED_BY:       'Next Gen Innovations Nepal Private Limited',
  ADMIN_EMAILS:     ['abhishek.paswan@nextgeninnovations.com.np', 'abhi.pwn2020@gmail.com'],
  SUPPORT_EMAIL:    'info@nextgeninnovations.com.np',
  BASE_URL:         '/learn',
  ADMIN_URL:        '/learn/admin',
};
