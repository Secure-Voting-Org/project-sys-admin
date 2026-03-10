import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Search, RefreshCw, X, Download } from 'lucide-react';
import API_BASE from '../config/api';

const ElectoralRoll = () => {
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [filterConstituency, setFilterConstituency] = useState('');
    const [form, setForm] = useState({ aadhaar_number: '', name: '', phone: '', constituency: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState(null);

    const headers = () => {
        const token = localStorage.getItem('sysadmin_token');
        return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
    };

    const fetchCitizens = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filterConstituency) params.set('constituency', filterConstituency);
            const res = await fetch(`${API_BASE}/api/electoral-roll?${params}`, { headers: headers() });
            const data = await res.json();
            setCitizens(Array.isArray(data) ? data : []);
        } catch { setCitizens([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCitizens(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg(null);
        try {
            // Note: Single insertions can use the bulk import route too using an array of 1
            const res = await fetch(`${API_BASE}/api/electoral-roll/import`, {
                method: 'POST', headers: headers(), 
                body: JSON.stringify({ csvData: [ { aadhaar_number: form.aadhaar_number, full_name: form.name, constituency: form.constituency } ] })
            });
            const data = await res.json();
            if (res.ok) {
                setMsg({ type: 'success', text: `Citizen "${form.name}" added to electoral roll.` });
                setForm({ aadhaar_number: '', name: '', phone: '', constituency: '' });
                setShowForm(false);
                fetchCitizens();
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to add citizen' });
            }
        } catch { setMsg({ type: 'error', text: 'Network error' }); }
        finally { setSubmitting(false); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubmitting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            // Basic CSV parsing
            const rows = text.split('\n').map(row => row.split(',')).filter(r => r.length >= 3);
            const headersRow = rows.shift(); // remove header
            
            const csvData = rows.map(r => ({
                aadhaar_number: r[0]?.trim(),
                full_name: r[1]?.trim(),
                constituency: r[2]?.trim()
            })).filter(r => r.aadhaar_number && r.full_name && r.constituency);

            if (csvData.length === 0) {
                setMsg({ type: 'error', text: 'No valid data found in CSV.' });
                setSubmitting(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/electoral-roll/import`, {
                    method: 'POST', headers: headers(), body: JSON.stringify({ csvData })
                });
                const data = await res.json();
                if (res.ok) {
                    setMsg({ type: 'success', text: data.message || `Imported ${csvData.length} records.` });
                    fetchCitizens();
                } else {
                    setMsg({ type: 'error', text: data.error || 'Failed to import CSV' });
                }
            } catch (err) {
                setMsg({ type: 'error', text: 'Network error during import.' });
            } finally {
                setSubmitting(false);
                e.target.value = null; // reset input
            }
        };
        reader.readAsText(file);
    };

    const handleDelete = async (aadhaar, name) => {
        if (!window.confirm(`Remove citizen "${name}" (${aadhaar}) from the electoral roll?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/electoral-roll/${aadhaar}`, { method: 'DELETE', headers: headers() });
            if (res.ok) { setMsg({ type: 'success', text: `Citizen removed.` }); fetchCitizens(); }
            else { setMsg({ type: 'error', text: 'Failed to remove citizen' }); }
        } catch { setMsg({ type: 'error', text: 'Network error' }); }
    };

    const uniqueConstituencies = [...new Set(citizens.map(c => c.constituency))].sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Electoral Roll</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage the list of citizens eligible to register as voters.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer">
                        <Download size={16} className="rotate-180" /> Bulk Import (CSV)
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={submitting} />
                    </label>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                        <Plus size={16} /> Add Citizen
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`px-4 py-3 rounded-lg flex justify-between items-center ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <span>{msg.text}</span>
                    <button onClick={() => setMsg(null)}><X size={16} /></button>
                </div>
            )}

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Add Citizen to Electoral Roll</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Aadhaar Number * (12 digits)', key: 'aadhaar_number', type: 'text', placeholder: '123456789012', maxLength: 12 },
                            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Ramesh Kumar' },
                            { label: 'Phone *', key: 'phone', type: 'tel', placeholder: '9876543210' },
                            { label: 'Constituency *', key: 'constituency', type: 'text', placeholder: 'Kuppam' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{f.label}</label>
                                <input
                                    type={f.type} placeholder={f.placeholder} required
                                    maxLength={f.maxLength} value={form[f.key]}
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        ))}
                        <div className="md:col-span-2 flex gap-3 mt-2">
                            <button type="submit" disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
                                {submitting ? 'Adding...' : 'Add to Roll'}
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
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or Aadhaar..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <select value={filterConstituency} onChange={e => setFilterConstituency(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">All Constituencies</option>
                        {uniqueConstituencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={fetchCitizens} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500" title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                    {citizens.length} citizen{citizens.length !== 1 ? 's' : ''} in roll
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading electoral roll...</div>
                ) : citizens.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No citizens found. Add some above.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                {['Aadhaar', 'Name', 'Phone', 'Constituency', 'Registered?', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {citizens.map(c => (
                                <tr key={c.aadhaar_number} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-gray-700 text-xs">{c.aadhaar_number}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">{c.full_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.phone || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.constituency}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.is_registered ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {c.is_registered ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(c.aadhaar_number, c.name)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                            <Trash2 size={15} />
                                        </button>
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

export default ElectoralRoll;
