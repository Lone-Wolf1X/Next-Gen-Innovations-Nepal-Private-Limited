// =========================================================
// GyanBazi — Firebase Configuration
// Project: nextgen-learn-2c351
// =========================================================

// Firebase SDK (v9 compat mode for easier CDN usage)
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase (compat SDK loaded via CDN in HTML)
firebase.initializeApp(firebaseConfig);

// Export services for use across files
const auth = firebase.auth();
// const db   = firebase.firestore(); // Migrated to PHP/MySQL (see db.js)

// ─── Platform Config ─────────────────────────────────────
const NGL_CONFIG = {
  PLATFORM_NAME:    'GyanBazi',
  PLATFORM_SHORT:   'NGL',
  POWERED_BY:       'Next Gen Innovations Nepal Private Limited',
  ADMIN_EMAILS:     ['abhishek.paswan@nextgeninnovations.com.np', 'abhi.pwn2020@gmail.com'],
  SUPPORT_EMAIL:    'info@nextgeninnovations.com.np',
  BASE_URL:         '/gyanbazi',
  ADMIN_URL:        '/gyanbazi/admin',
};
