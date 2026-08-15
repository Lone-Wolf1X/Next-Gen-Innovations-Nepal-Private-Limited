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
      return { success: true, user: result.user };
    } catch (err) {
      console.error('Google Sign-in error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Email Sign-In / Sign-Up ──────────────────────────────
  async function signInWithEmail(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function signUpWithEmail(email, password, name) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      await result.user.sendEmailVerification();
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ─── Sign Out ────────────────────────────────────────────
  async function signOut() {
    await auth.signOut();
    window.location.href = '/learn/homepage.html';
  }

  // ─── Sync with PHP Backend ────────────────────────────────
  async function syncBackend(user) {
    try {
      return await DB.users.syncFirebaseUser(user);
    } catch (e) {
      console.error("Failed to sync with backend:", e);
      return null;
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
          return;
        }

        // 1. Check Email Verification
        if (!user.emailVerified) {
          if (!window.location.pathname.includes('verify-email.html')) {
            window.location.href = '/learn/verify-email.html';
          }
          resolve(user);
          return;
        }

        // 2. Sync and Check Profile Completion
        const syncRes = await syncBackend(user);
        const profileCompleted = syncRes && syncRes.profileCompleted;

        if (!profileCompleted) {
          if (!window.location.pathname.includes('complete-profile.html')) {
            window.location.href = '/learn/complete-profile.html';
          }
        } else {
          // If profile is completed, check enrollments
          try {
            const enrollments = await fetch('/learn/backend/api/vacancies.php?action=myEnrollments', {
              headers: { 'Authorization': `Bearer ${user.uid}` }
            }).then(r => r.json());

            if (Array.isArray(enrollments) && enrollments.length === 0) {
              if (!window.location.pathname.includes('courses.html')) {
                window.location.href = '/learn/courses.html';
              }
            } else {
              // If profile is completed and enrolled, push to dashboard from wizard pages
              if (window.location.pathname.includes('complete-profile.html') || window.location.pathname.includes('verify-email.html') || window.location.pathname.includes('courses.html')) {
                window.location.href = '/learn/index.html';
              }
            }
          } catch (e) {
            console.error("Enrollment check failed", e);
          }
        }
        resolve(user);
      });
    });
  }

  function requireAdmin(redirectUrl = '/learn/index.html') {
    return new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged(async (user) => {
        unsub();
        if (!user) {
          window.location.href = `/learn/login.html?next=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        
        // Admins must also be verified and completed
        if (!user.emailVerified) {
          window.location.href = '/learn/verify-email.html';
          return;
        }

        const syncRes = await syncBackend(user);
        if (!syncRes || !syncRes.profileCompleted) {
          window.location.href = '/learn/complete-profile.html';
          return;
        }

        const dbUser = await DB.users.getById(user.uid);
        if (dbUser && dbUser.role === 'admin') {
          resolve(user);
        } else {
          window.location.href = redirectUrl;
        }
      });
    });
  }

  function redirectIfLoggedIn(redirectUrl = 'index.html') {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        if (!user.emailVerified) {
          window.location.href = '/learn/verify-email.html';
          return;
        }
        const syncRes = await syncBackend(user);
        if (syncRes && !syncRes.profileCompleted) {
          window.location.href = '/learn/complete-profile.html';
          return;
        }

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
    signInWithEmail,
    signUpWithEmail,
    signOut,
    requireAuth,
    requireAdmin,
    redirectIfLoggedIn,
    renderUserAvatar,
  };
})();
