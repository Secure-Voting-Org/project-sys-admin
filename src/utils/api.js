import API_BASE from '../config/api';

// Consistent device hash for all web-based admin API calls.
// Must match what is sent on login so session verification passes.
const WEB_DEVICE_HASH = 'web-sysadmin-portal';

export const API_BASE_URL = `${API_BASE}/api/sys-admin`;

export const api = {
    getHeaders: () => {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('sysadmin_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Must match the device hash used at login time for session verification
        headers['x-device-hash'] = WEB_DEVICE_HASH;
        return headers;
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-hash': WEB_DEVICE_HASH  // Must send on login so session is created with this hash
            },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    sendOtp: async (email) => {
        const response = await fetch(`${API_BASE_URL}/forgot-password/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return response.json();
    },

    verifyOtp: async (email, otp) => {
        const response = await fetch(`${API_BASE_URL}/forgot-password/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        return response.json();
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/forgot-password/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword }),
        });
        return response.json();
    },
};
