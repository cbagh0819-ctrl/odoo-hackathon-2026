const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('brightloop_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('brightloop_token', token);
  } else {
    localStorage.removeItem('brightloop_token');
  }
}

export function clearAuth() {
  localStorage.removeItem('brightloop_token');
  localStorage.removeItem('brightloop_user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('brightloop_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('brightloop_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('brightloop_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  return response.json();
}
