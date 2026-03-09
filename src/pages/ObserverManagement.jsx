import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, RefreshCw, X } from 'lucide-react';
import API_BASE from '../config/api';

const ObserverManagement = () => {
    const [observers, setObservers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'general' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null);

    const headers = () => {
        const token = localStorage.getItem('sysadmin_token');
        return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
    };

    const fetchObservers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/sysadmin/observers`, { headers: headers() });
            const data = await res.json();
            setObservers(Array.isArray(data) ? data : []);
        } catch { setObservers([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchObservers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/sysadmin/observers`, {
                method: 'POST', headers: headers(), body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setMsg({ type: 'success', text: `Observer "${form.username}" created!` });
                setForm({ username: '', password: '', fullName: '', email: '', role: 'general' });
                setShowForm(false);
                fetchObservers();
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to create observer' });
            }
        } catch { setMsg({ type: 'error', text: 'Network error' }); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Delete observer "${username}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/sysadmin/observers/${id}`, { method: 'DELETE', headers: headers() });
            if (res.ok) { setMsg({ type: 'success', text: `Observer "${username}" removed.` }); fetchObservers(); }
            else { setMsg({ type: 'error', text: 'Failed to delete observer' }); }
        } catch { setMsg({ type: 'error', text: 'Network error' }); }
    };

    const filtered = observers.filter(o =>
        o.username?.toLowerCase().includes(search.toLowerCase()) ||
        o.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Observer Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage election observers and their access credentials.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                    <Plus size={16} /> Add Observer
                </button>
            </div>

            {msg && (
                <div className={`px-4 py-3 rounded-lg flex justify-between items-center ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <span>{msg.text}</span>
                    <button onClick={() => setMsg(null)}><X size={16} /></button>
                </div>
            )}

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">New Observer Account</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Username *', key: 'username', type: 'text', placeholder: 'e.g. observer2' },
                            { label: 'Password *', key: 'password', type: 'password', placeholder: '••••••••' },
                            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Election Observer Two' },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'observer@domain.com' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{f.label}</label>
                                <input
                                    type={f.type} placeholder={f.placeholder}
                                    value={form[f.key]} required={f.label.includes('*')}
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Role</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="general">General Observer</option>
                                <option value="senior">Senior Observer</option>
                                <option value="auditor">Auditor</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex gap-3 mt-2">
                            <button type="submit" disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
                                {submitting ? 'Creating...' : 'Create Observer'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search observers..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={fetchObservers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No observers found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                {['Username', 'Full Name', 'Email', 'Role', 'Created', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-800">{o.username}</td>
                                    <td className="px-4 py-3 text-gray-600">{o.full_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500">{o.email || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">{o.role}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {o.username !== 'observer1' && (
                                            <button onClick={() => handleDelete(o.id, o.username)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ObserverManagement;
