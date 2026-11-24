import { auth } from './firebase';

const API_BASE = '/gyanbazi/backend/api';

/**
 * Custom fetch wrapper that automatically attaches the Firebase user ID (uid)
 * as a Bearer token, matching the old HTML/JS implementation.
 */
export async function fetchAPI(endpoint: string, method = 'GET', data: any = null) {
  let uid = '';
  if (auth && auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uid}`,
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, options);
    const text = await res.text();
    let parsedData = null;
    
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      // Not JSON
    }
    
    if (!res.ok) {
      if (parsedData && parsedData.error) {
        throw new Error(parsedData.error);
      }
      throw new Error(`API Error: ${res.status}`);
    }
    
    return parsedData;
  } catch (err) {
    console.error('API Fetch failed:', err);
    throw err;
  }
}

// Export individual resource handlers here mirroring db.js
export const api = {
  categories: {
    getAll: () => fetchAPI('categories.php?action=getAll'),
    // Add other category endpoints as needed
  },
  // Add other API resources (subjects, users, vacancies)
};
