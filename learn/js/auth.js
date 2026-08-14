// =========================================================
// GyanBazi — Authentication Module
// Handles Google Sign-In, route guards, PHP backend sync
// =========================================================

const Auth = (() => {

  // ─── Google Sign-In ─────────────────────────────────────
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await auth.signInWithPopup(provider);
      await syncBackend(result.user);
      
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('next') ? decodeURIComponent(params.get('next')) : 'index.html';
      window.location.href = redirectUrl;
      return { success: true, user: result.user };
    } catch (err) {
      console.error('Sign-in error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Sign Out ────────────────────────────────────────────
  async function signOut() {
    await auth.signOut();
    window.location.href = '/learn/index.html';
  }

  // ─── Sync with PHP Backend ────────────────────────────────
  async function syncBackend(user) {
    try {
      await DB.users.syncFirebaseUser(user);
      await DB.users.recordLogin(user.uid);
    } catch (e) {
      console.error("Failed to sync with backend:", e);
    }
  }

  // ─── Route Guards ────────────────────────────────────────
  function requireAuth(redirectUrl = '/learn/login.html') {
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged(async (user) => {
        unsub();
        if (!user) {
          const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `${redirectUrl}?next=${currentPath}`;
        } else {
          // Keep backend streak updated
          await syncBackend(user);
          resolve(user);
        }
      });
    });
  }

  function redirectIfLoggedIn(redirectUrl = 'index.html') {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        window.location.href = next ? decodeURIComponent(next) : redirectUrl;
      }
    });
  }

  // ─── Render User Avatar in Topbar ────────────────────────
  function renderUserAvatar(containerSelector) {
    auth.onAuthStateChanged((user) => {
      const container = document.querySelector(containerSelector);
      if (!container || !user) return;
      const img = user.photoURL
        ? `<img src="${user.photoURL}" alt="${user.displayName}" class="sidebar-avatar">`
        : `<div class="sidebar-avatar">${(user.displayName || 'U')[0].toUpperCase()}</div>`;
      const nameEl = container.querySelector('.sidebar-user-name');
      const emailEl = container.querySelector('.sidebar-user-email');
      const avatarEl = container.querySelector('.avatar-placeholder');
      if (avatarEl) avatarEl.outerHTML = img;
      if (nameEl) nameEl.textContent = user.displayName || 'User';
      if (emailEl) emailEl.textContent = user.email;
    });
  }

  return {
    signInWithGoogle,
    signOut,
    requireAuth,
    redirectIfLoggedIn,
    renderUserAvatar,
  };
})();
