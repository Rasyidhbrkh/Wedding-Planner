const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('wedding_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('wedding_token');
        localStorage.removeItem('wedding_user');
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Savings
  getSavings: () => request('/savings'),
  createSavings: (data) => request('/savings', { method: 'POST', body: JSON.stringify(data) }),
  updateSavings: (id, data) => request(`/savings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSavings: (id) => request(`/savings/${id}`, { method: 'DELETE' }),

  // Budget
  getBudget: (category = '') => request(`/budget${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createBudget: (data) => request('/budget', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id, data) => request(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudget: (id) => request(`/budget/${id}`, { method: 'DELETE' }),

  // Checklist
  getChecklist: () => request('/checklist'),
  createChecklist: (data) => request('/checklist', { method: 'POST', body: JSON.stringify(data) }),
  updateChecklist: (id, data) => request(`/checklist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleChecklist: (id) => request(`/checklist/${id}/toggle`, { method: 'PATCH' }),
  deleteChecklist: (id) => request(`/checklist/${id}`, { method: 'DELETE' }),

  // Rundown
  getRundown: () => request('/rundown'),
  createRundown: (data) => request('/rundown', { method: 'POST', body: JSON.stringify(data) }),
  updateRundown: (id, data) => request(`/rundown/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRundown: (id) => request(`/rundown/${id}`, { method: 'DELETE' }),

  // Guests
  getGuests: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.rsvp) params.append('rsvp', filters.rsvp);
    if (filters.table) params.append('table', filters.table);
    const qs = params.toString();
    return request(`/guests${qs ? `?${qs}` : ''}`);
  },
  createGuest: (data) => request('/guests', { method: 'POST', body: JSON.stringify(data) }),
  updateGuest: (id, data) => request(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleSouvenir: (id) => request(`/guests/${id}/souvenir`, { method: 'PATCH' }),
  deleteGuest: (id) => request(`/guests/${id}`, { method: 'DELETE' }),

  // Vendors
  getVendors: (category = '') => request(`/vendors${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createVendor: (data) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendor: (id, data) => request(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVendor: (id) => request(`/vendors/${id}`, { method: 'DELETE' }),

  // Tables
  getTables: () => request('/tables'),
  createTable: (data) => request('/tables', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id, data) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (id) => request(`/tables/${id}`, { method: 'DELETE' }),

  // Bridal Party
  getBridalParty: () => request('/bridal-party'),
  createBridalParty: (data) => request('/bridal-party', { method: 'POST', body: JSON.stringify(data) }),
  updateBridalParty: (id, data) => request(`/bridal-party/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBridalParty: (id) => request(`/bridal-party/${id}`, { method: 'DELETE' }),
};

export const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};
