import React, { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, AlertTriangle, Lock, Filter, Vote } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import API_BASE from '../config/api';
import { api } from '../utils/api';

const UserIntegrity = () => {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    // Get filter from URL or default to 'all'
    const currentFilter = searchParams.get('filter') || 'all';

    useEffect(() => {
        fetchVoters();
    }, []);

    const fetchVoters = async () => {
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/admin/voters`, {
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setVoters(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Voters Fetch Error:", errorData.error || res.statusText);
            }
        } catch (err) {
            console.error("Failed to fetch voters", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType) => {
        setSearchParams({ filter: filterType });
    };

    const filteredVoters = voters.filter(v => {
        const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.reference_id?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (currentFilter === 'voted') matchesFilter = v.has_voted;
        if (currentFilter === 'pending') matchesFilter = v.status === 'PENDING';
        if (currentFilter === 'locked') matchesFilter = v.locked_until !== null;

        return matchesSearch && matchesFilter;
    });

    const tabs = [
        { id: 'all', label: 'All Voters', icon: null },
        { id: 'voted', label: 'Votes Cast', icon: Vote },
        { id: 'pending', label: 'Pending Verification', icon: AlertTriangle },
        { id: 'locked', label: 'Locked Accounts', icon: Lock },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Integrity</h2>
                    <p className="text-gray-500 text-sm">Monitor voter accounts, verification status, and voting activity.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={18} />
                    <input
                        type="text"
                        placeholder="Search Voter ID or Name..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleFilterChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${currentFilter === tab.id
                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-800 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                    >
                        {tab.icon && <tab.icon size={16} />}
                        {tab.label}
                        <span className="bg-gray-100 text-gray-800 py-0.5 px-2 rounded-full text-xs ml-2">
                            {/* Simple count logic for tabs could be added here if needed */}
                            {tab.id === 'all' ? voters.length :
                                tab.id === 'voted' ? voters.filter(v => v.has_voted).length :
                                    tab.id === 'pending' ? voters.filter(v => v.status === 'PENDING').length :
                                        voters.filter(v => v.locked_until).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-800 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Reference ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Constituency</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Voting Status</th>
                                <th className="px-6 py-4">Account Security</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-800">Loading voter registry...</td></tr>
                            ) : filteredVoters.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-800">No voters found matching current filter.</td></tr>
                            ) : (
                                filteredVoters.map((voter) => (
                                    <tr key={voter.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-blue-600">{voter.reference_id || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {voter.name} {voter.surname}
                                            <div className="text-xs text-gray-800">{new Date(voter.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 text-sm">{voter.constituency}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${voter.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                voter.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {voter.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {voter.has_voted ? (
                                                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs bg-blue-50 px-2 py-1 rounded-full w-fit">
                                                    <Vote size={14} /> VOTED
                                                </div>
                                            ) : (
                                                <span className="text-gray-800 text-xs">Not Voted</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {voter.locked_until ? (
                                                <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
                                                    <Lock size={14} /> LOCKED
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                                                    <CheckCircle size={14} /> ACTIVE
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserIntegrity;
