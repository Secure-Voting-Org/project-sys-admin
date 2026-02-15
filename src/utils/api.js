export const API_BASE_URL = '/api/sys-admin';

export const api = {
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
