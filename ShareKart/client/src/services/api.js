const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sharekart_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(name, email, password, phone, location) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, location })
    });
    return handleResponse(res);
  },

  async sendRegistrationOtp(phone) {
    const res = await fetch(`${API_BASE}/auth/send-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return handleResponse(res);
  },

  async verifyRegistrationOtp(phone, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-registration-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getDemoUsers() {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return handleResponse(res);
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${queryString}`);
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },

  async updateProduct(id, updates) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  // Rentals & Checkout
  async calculateRentalCost(params) {
    const res = await fetch(`${API_BASE}/rentals/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return handleResponse(res);
  },

  async checkout(orderData) {
    const res = await fetch(`${API_BASE}/rentals/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(res);
  },

  async getMyRentals() {
    const res = await fetch(`${API_BASE}/rentals/my-rentals`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateRentalStatus(id, status, escrow_status) {
    const res = await fetch(`${API_BASE}/rentals/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, escrow_status })
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPendingRequests() {
    const res = await fetch(`${API_BASE}/dashboard/requests`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getInventory() {
    const res = await fetch(`${API_BASE}/dashboard/inventory`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getContracts() {
    const res = await fetch(`${API_BASE}/dashboard/contracts`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async withdrawPayout(amount, upiId) {
    const res = await fetch(`${API_BASE}/dashboard/withdraw`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, upiId })
    });
    return handleResponse(res);
  },

  // Messages
  async getMessages(otherUserId, productId) {
    const res = await fetch(`${API_BASE}/messages?otherUserId=${otherUserId || 2}&productId=${productId || 1}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async sendMessage(receiverId, productId, content) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, productId, content })
    });
    return handleResponse(res);
  },

  // Authentication
  async otpLogin(phone) {
    const res = await fetch(`${API_BASE}/auth/otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return handleResponse(res);
  },

  async verifyAadhaar(aadhaarNumber) {
    const res = await fetch(`${API_BASE}/auth/verify-aadhaar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ aadhaarNumber })
    });
    return handleResponse(res);
  },

  async getUserProfile(userId) {
    const res = await fetch(`${API_BASE}/auth/profile/${userId || ''}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(res);
  },

  // Phase 3: Dispute Mediation & Arbitration Center
  async getDisputes() {
    const res = await fetch(`${API_BASE}/disputes`);
    return handleResponse(res);
  },

  async fileDispute(disputeData) {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(disputeData)
    });
    return handleResponse(res);
  },

  async resolveDispute(id, action, resolutionNotes) {
    const res = await fetch(`${API_BASE}/disputes/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, resolution_notes: resolutionNotes })
    });
    return handleResponse(res);
  },

  // Phase 3: Return Handover & Escrow Security Deposit Refund
  async completeReturn(rentalId, upiId = 'aarav@okaxis', checklistPassed = true) {
    const res = await fetch(`${API_BASE}/rentals/${rentalId}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ upi_id: upiId, checklist_passed: checklistPassed })
    });
    return handleResponse(res);
  }
};

