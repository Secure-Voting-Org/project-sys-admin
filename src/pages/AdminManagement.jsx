import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield, X, Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import API_BASE from '../config/api';
import { api } from '../utils/api';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'PRE_POLL'
    });
    const [message, setMessage] = useState(null); // Success/Error banner

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/admin/list`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                setMessage({ type: 'error', text: errorData.error || `Failed to fetch admins: ${res.statusText}` });
            }
        } catch (err) {
            console.error("Failed to fetch admins", err);
        } finally {
            setLoading(false);
        }
    };

    // Open Modal
    const handleOpenModal = (mode, admin = null) => {
        setModalMode(mode);
        setSelectedAdmin(admin);
        if (mode === 'edit' && admin) {
            setFormData({
                fullName: admin.full_name,
                username: admin.username,
                email: admin.email,
                password: '', // Password usually blank on edit unless changing
                role: admin.role
            });
        } else {
            setFormData({ fullName: '', username: '', email: '', password: '', role: 'PRE_POLL' });
        }
        setIsModalOpen(true);
        setMessage(null);
    };

    // Close Modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };

    // Handle Form Input
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Submit Form (Create/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const baseUrl = API_BASE;

        try {
            const headers = api.getHeaders();

            let res;
            if (modalMode === 'create') {
                res = await fetch(`${baseUrl}/api/admin/register`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData)
                });
            } else {
                // Edit Mode
                res = await fetch(`${baseUrl}/api/admin/${selectedAdmin.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: modalMode === 'create' ? 'Admin created successfully!' : 'Admin updated successfully!' });
                fetchAdmins();
                handleCloseModal();
            } else {
                setMessage({ type: 'error', text: data.error || 'Operation failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred: ' + err.message });
        }
    };

    // Delete Admin
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) return;

        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/admin/${id}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Admin deleted successfully' });
                fetchAdmins();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to delete' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error during delete.' });
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
                    <p className="text-gray-800 text-sm">Manage election officials and system administrators.</p>
                </div>
                <button
                    onClick={() => handleOpenModal('create')}
                    className="bg-[#000080] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-colors"
                >
                    <UserPlus size={18} />
                    New Admin
                </button>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-500">Loading administrators...</p>
                ) : admins.length > 0 ? (
                    admins.map((admin) => (
                        <div key={admin.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9933] font-bold text-xl border border-orange-100">
                                    {admin.full_name?.charAt(0) || 'A'}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700`}>
                                    {admin.role}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{admin.full_name}</h3>
                            <p className="text-gray-600 text-sm mb-4">@{admin.username}</p>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    {admin.email || 'No Email'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} />
                                    {admin.role === 'LIVE' ? 'Full Access' : 'Restricted'}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal('edit', admin)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 text-sm font-semibold flex items-center justify-center gap-1"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 flex items-center justify-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No admins found.</p>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {modalMode === 'create' ? 'Create New Admin' : 'Edit Admin'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'edit'} // Username immutable usually
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-gray-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-800"
                                    >
                                        <option value="PRE_POLL">Pre-Poll</option>
                                        <option value="LIVE">Live Controller</option>
                                        <option value="POST_POLL">Post-Poll</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                    required
                                />
                            </div>

                            {modalMode === 'create' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                        required={modalMode === 'create'}
                                        placeholder={modalMode === 'edit' ? "Leave blank to keep current" : ""}
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 rounded-lg bg-[#000080] text-white font-medium hover:opacity-90 transition-opacity shadow-md"
                                >
                                    {modalMode === 'create' ? 'Create Admin' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
