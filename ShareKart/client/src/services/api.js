import { INITIAL_PRODUCTS } from '../data/initialData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("sharekart_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg =
      data.errors && Array.isArray(data.errors) && data.errors.length > 0
        ? data.errors.map((e) => e.message || `${e.field} is invalid`).join(', ')
        : (data.message || "API request failed");
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(name, email, password, phone, location, city, pincode) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        location,
        city,
        pincode,
      }),
    });
    return handleResponse(res);
  },

  async sendRegistrationOtp(phone) {
    const res = await fetch(`${API_BASE}/auth/send-registration-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return handleResponse(res);
  },

  async verifyRegistrationOtp(phone, otp, name = "") {
    const res = await fetch(`${API_BASE}/auth/verify-registration-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, name }),
    });
    return handleResponse(res);
  },

  async verifyPhoneEmail(userjson_url, phoneFallback = null) {
    const res = await fetch(`${API_BASE}/auth/phone-email-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userjson_url, phone: phoneFallback }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
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
    try {
      const defaultLoc = localStorage.getItem('sharekart_current_location') || 'Gandhinagar, Sector 7';
      const queryPayload = {
        location: defaultLoc,
        ...params,
      };
      Object.keys(queryPayload).forEach((k) => {
        if (queryPayload[k] === '' || queryPayload[k] === null || queryPayload[k] === undefined) {
          delete queryPayload[k];
        }
      });
      const queryString = new URLSearchParams(queryPayload).toString();
      const res = await fetch(`${API_BASE}/products?${queryString}`);
      const data = await handleResponse(res);
      if (data?.success && Array.isArray(data.products)) {
        const apiIds = new Set(data.products.map(p => p.id));
        const extraInitial = (INITIAL_PRODUCTS || []).filter(p => !apiIds.has(p.id));
        return {
          ...data,
          products: [...data.products, ...extraInitial]
        };
      }
      return data;
    } catch (err) {
      console.warn('api.getProducts fallback to initialData', err);
      return { success: true, products: INITIAL_PRODUCTS, count: (INITIAL_PRODUCTS || []).length };
    }
  },

  async getProductById(id) {
    const cleanId = String(id).replace(/^[#\s]*SK-?/i, "").trim();
    const numId = Number(cleanId);
    try {
      const res = await fetch(`${API_BASE}/products/${cleanId}`);
      const data = await handleResponse(res);
      if (data?.success && data.product) {
        return data;
      }
    } catch (err) {
      console.warn('api.getProductById fallback to initialData', err);
    }
    const found = (INITIAL_PRODUCTS || []).find(p => p.id === numId || String(p.id) === String(id) || String(p.id) === cleanId);
    if (found) {
      return { success: true, product: found };
    }
    throw new Error(`Product not found for ID ${id}`);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id, updates) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Rentals & Checkout
  async calculateRentalCost(params) {
    const res = await fetch(`${API_BASE}/rentals/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async checkout(orderData) {
    const res = await fetch(`${API_BASE}/rentals/checkout`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  async getMyRentals() {
    const res = await fetch(`${API_BASE}/rentals/my-rentals`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateRentalStatus(id, status, escrow_status) {
    const res = await fetch(`${API_BASE}/rentals/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, escrow_status }),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getPendingRequests() {
    const res = await fetch(`${API_BASE}/dashboard/requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getInventory() {
    const res = await fetch(`${API_BASE}/dashboard/inventory`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getContracts() {
    const res = await fetch(`${API_BASE}/dashboard/contracts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async withdrawPayout(amount, upiId) {
    const res = await fetch(`${API_BASE}/dashboard/withdraw`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, upiId }),
    });
    return handleResponse(res);
  },

  // Messages
  async getMessages(otherUserId, productId) {
    const res = await fetch(
      `${API_BASE}/messages?otherUserId=${otherUserId || 2}&productId=${productId || 1}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(res);
  },

  async sendMessage(receiverId, productId, content) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, productId, content }),
    });
    return handleResponse(res);
  },

  // Authentication
  async otpLogin(phone) {
    const res = await fetch(`${API_BASE}/auth/otp-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return handleResponse(res);
  },

  // Identity Verification (Aadhaar e-KYC & Cryptographic Document Validation)
  async getIdentityVerificationStatus() {
    const res = await fetch(`${API_BASE}/identity-verification/status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createIdentityVerificationSession() {
    const res = await fetch(`${API_BASE}/identity-verification/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadIdentityVerificationDocument(data) {
    const res = await fetch(`${API_BASE}/identity-verification/document`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async completeIdentityVerificationSession(sessionId) {
    const res = await fetch(
      `${API_BASE}/identity-verification/sessions/${sessionId}/complete`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(res);
  },

  async cancelIdentityVerificationSession(sessionId) {
    const res = await fetch(
      `${API_BASE}/identity-verification/sessions/${sessionId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );
    return handleResponse(res);
  },

  async getUserProfile(userId) {
    const res = await fetch(`${API_BASE}/auth/profile/${userId || ""}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
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
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(disputeData),
    });
    return handleResponse(res);
  },

  async resolveDispute(id, action, resolutionNotes) {
    const res = await fetch(`${API_BASE}/disputes/${id}/resolve`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, resolution_notes: resolutionNotes }),
    });
    return handleResponse(res);
  },

  // Phase 3: Return Handover & Escrow Security Deposit Refund
  async completeReturn(
    rentalId,
    upiId = "aarav@okaxis",
    checklistPassed = true,
  ) {
    const res = await fetch(`${API_BASE}/rentals/${rentalId}/return`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        upi_id: upiId,
        checklist_passed: checklistPassed,
      }),
    });
    return handleResponse(res);
  },
};
