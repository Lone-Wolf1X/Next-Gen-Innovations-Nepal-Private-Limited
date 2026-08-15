// =========================================================
// GyanBazi — Data Layer (db.js)
// Rewritten for PHP/MySQL REST API Backend
// =========================================================

const API_BASE = '/learn/backend/api';

const fetchAPI = async (endpoint, method = 'GET', data = null) => {
  // We can pass the Firebase UID in headers or trust the session
  const user = firebase.auth().currentUser;
  const uid = user ? user.uid : '';

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uid}` // Sending UID as a simple token
    }
  };
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, options);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) {}
    
    if (!res.ok) {
      if (data && data.error) throw new Error(data.error);
      throw new Error(`API Error: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('API Fetch failed:', err);
    throw err; // Re-throw so callers can handle specific errors
  }
};

const DB = (() => {

  // ─── EXAM CATEGORIES ────────────────────────────────────
  const categories = {
    async getAll() {
      return await fetchAPI('categories.php?action=getAll');
    },
    async getAllAdmin() {
      return await fetchAPI('categories.php?action=getAllAdmin');
    },
    async getById(id) {
      return await fetchAPI(`categories.php?action=getById&id=${id}`);
    },
    async create(data, adminId) {
      const res = await fetchAPI('categories.php?action=create', 'POST', { ...data, adminId });
      return res?.id;
    },
    async update(id, data, adminId) {
      await fetchAPI(`categories.php?action=update&id=${id}`, 'PUT', { ...data, adminId });
    },
    async delete(id, adminId) {
      await fetchAPI(`categories.php?action=delete&id=${id}`, 'DELETE');
    },
    async getRoadmap(categoryId, userId = '') {
      return await fetchAPI(`categories.php?action=getRoadmap&categoryId=${categoryId}&userId=${userId}`);
    }
  };

  // ─── SUBJECTS ────────────────────────────────────────────
  const subjects = {
    async getByCategory(categoryId) {
      return await fetchAPI(`subjects.php?action=getByCategory&categoryId=${categoryId}`);
    },
    async getAll() {
      return await fetchAPI('subjects.php?action=getAll');
    },
  };

  // ─── QUESTIONS ───────────────────────────────────────────
  const questions = {
    async getByCategory(categoryId, limit = 100) {
      return await fetchAPI(`questions.php?action=getByCategory&categoryId=${categoryId}&limit=${limit}`);
    },
    async getByIds(ids) {
      if (!ids || ids.length === 0) return [];
      return await fetchAPI('questions.php?action=getByIds', 'POST', { ids });
    },
    async getAll(filters = {}) {
      const qs = new URLSearchParams(filters).toString();
      return await fetchAPI(`questions.php?action=getAll&${qs}`);
    },
  };

  // ─── MODEL SETS ──────────────────────────────────────────
  const modelSets = {
    async getPublished(categoryId = null) {
      const qs = categoryId ? `&categoryId=${categoryId}` : '';
      return await fetchAPI(`model_sets.php?action=getPublished${qs}`);
    },
    async getAll() {
      return await fetchAPI('model_sets.php?action=getAll');
    },
    async getById(id) {
      return await fetchAPI(`model_sets.php?action=getById&id=${id}`);
    },
    async getWithQuestions(id) {
      return await fetchAPI(`model_sets.php?action=getWithQuestions&id=${id}`);
    },
    async create(data, adminId) {
      const res = await fetchAPI('model_sets.php?action=create', 'POST', { ...data, adminId });
      return res?.id;
    },
  };

  // ─── TEST ATTEMPTS ───────────────────────────────────────
  const attempts = {
    async start(userId, modelSetId, totalQuestions, timeLimitMinutes) {
      return await fetchAPI('attempts.php?action=start', 'POST', { userId, modelSetId, totalQuestions, timeLimitMinutes });
    },
    async saveAnswer(attemptId, questionId, selectedOption, timeRemainingSeconds) {
      await fetchAPI(`attempts.php?action=saveAnswer&id=${attemptId}`, 'POST', { questionId, selectedOption, timeRemainingSeconds });
    },
    async toggleReview(attemptId, questionId, isMarked) {
      await fetchAPI(`attempts.php?action=toggleReview&id=${attemptId}`, 'POST', { questionId, isMarked });
    },
    async saveTimer(attemptId, timeRemainingSeconds) {
      await fetchAPI(`attempts.php?action=saveTimer&id=${attemptId}`, 'POST', { timeRemainingSeconds });
    },
    async getById(attemptId) {
      return await fetchAPI(`attempts.php?action=getById&id=${attemptId}`);
    },
  };

  // ─── TEST RESULTS ─────────────────────────────────────────
  const results = {
    async submit(attemptId, userId, modelSetId, attempt, set, questionList) {
      // In a real PHP app, this calculation should move entirely to the PHP server.
      // For this migration, we send the payload to a submit endpoint.
      return await fetchAPI('results.php?action=submit', 'POST', { attemptId, userId, modelSetId, attempt, set, questionList });
    },
    async getById(resultId) {
      return await fetchAPI(`results.php?action=getById&id=${resultId}`);
    },
    async getByUser(userId, limit = 20) {
      return await fetchAPI(`results.php?action=getByUser&userId=${userId}&limit=${limit}`);
    },
    async getByUserAndSet(userId, modelSetId) {
      return await fetchAPI(`results.php?action=getByUserAndSet&userId=${userId}&modelSetId=${modelSetId}`);
    },
  };

  // ─── AUDIT LOGS ──────────────────────────────────────────
  const AuditLog = {
    async write(adminId, action, entityType, entityId, before, after) {
      await fetchAPI('audit.php?action=write', 'POST', { adminId, action, entityType, entityId, before, after });
    },
    async getRecent(limit = 50) {
      return await fetchAPI(`audit.php?action=getRecent&limit=${limit}`);
    },
  };

  // ─── USER PROFILES ───────────────────────────────────────
  const users = {
    async getById(uid) {
      return await fetchAPI(`users.php?action=getById&uid=${uid}`);
    },
    async getAll(limit = 100) {
      return await fetchAPI(`users.php?action=getAll&limit=${limit}`);
    },
    async update(uid, data) {
      await fetchAPI(`users.php?action=update&uid=${uid}`, 'PUT', data);
    },
    async syncFirebaseUser(user) {
      return await fetchAPI('users.php?action=sync', 'POST', {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL
      });
    },
    async recordLogin(uid) {
      return await fetchAPI('users.php?action=recordLogin', 'POST', { uid });
    },
    async getAnalytics(uid) {
      return await fetchAPI(`users.php?action=getAnalytics&uid=${uid}`);
    },
    async completeProfile(nickname, phone, gender, avatarUrl) {
      return await fetchAPI('users.php?action=completeProfile', 'POST', { nickname, phone, gender, avatarUrl });
    },
    // Admin Only
    async getAll() {
      return await fetchAPI('users.php?action=getAllUsers');
    },
    async updateSubscription(targetUid, tier) {
      return await fetchAPI('users.php?action=updateSubscription', 'POST', { targetUid, tier });
    }
  };

  // ─── ADMIN STATS ─────────────────────────────────────────
  const adminStats = {
    async getDashboard() {
      return await fetchAPI('admin.php?action=getStats');
    },
  };

  return {
    categories,
    subjects,
    questions,
    modelSets,
    attempts,
    results,
    auditLog: AuditLog,
    users,
    adminStats,
  };
})();

// ─── UI UTILITIES ────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function formatDate(ts) {
  if (!ts) return '—';
  // Check if timestamp is MySQL date string or timestamp integer
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
