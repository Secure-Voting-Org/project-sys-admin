import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import API_BASE from '../config/api';
import { api } from '../utils/api';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [integrityStatus, setIntegrityStatus] = useState({ status: 'LOADING', lastChecked: null });
    const [nextCheckIn, setNextCheckIn] = useState(5);

    useEffect(() => {
        fetchLogs();
        fetchIntegrityStatus();

        const timer = setInterval(() => {
            setNextCheckIn(prev => {
                if (prev <= 1) {
                    fetchIntegrityStatus();
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchIntegrityStatus = async () => {
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/audit/integrity-status?t=${Date.now()}`, {
                headers
            });
            const data = await res.json();
            setIntegrityStatus(data);
        } catch (err) {
            console.error("Integrity Check Failed", err);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/audit/logs`, {
                headers
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (err) {
            console.error("Failed to fetch logs");
        } finally {
            const elapsed = Date.now() - startTime;
            if (elapsed < 800) {
                setTimeout(() => setLoading(false), 800 - elapsed);
            } else {
                setLoading(false);
            }
        }
    };

    const handleManualRefresh = () => {
        fetchLogs();
        fetchIntegrityStatus();
        setNextCheckIn(5);
    };

    const filteredLogs = logs.filter(log =>
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getEventStyle = (event) => {
        if (event.includes('FAILED') || event.includes('LOCKED')) {
            return { bg: '#fff5f5', color: '#c53030', border: '#fc8181', icon: XCircle };
        }
        if (event.includes('APPROVED') || event.includes('VERIFIED') || event.includes('VOTE_CAST') || event.includes('LOGIN')) {
            return { bg: '#f0fdf4', color: '#166534', border: '#86efac', icon: CheckCircle };
        }
        return { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd', icon: AlertCircle };
    };

    return (
        <div className="space-y-6">
            {/* Blockchain Integrity Watchdog */}
            <div className={`p-6 rounded-xl border flex items-center justify-between ${integrityStatus.status === 'HEALTHY' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl text-white shadow-sm ${integrityStatus.status === 'HEALTHY' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Blockchain Integrity Watchdog</h3>
                        <p className="text-sm text-gray-600">
                            {integrityStatus.status === 'HEALTHY'
                                ? 'All blocks verified. Ledger is immutable and secure.'
                                : integrityStatus.message || 'Tamper detected or connection failed!'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${integrityStatus.status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {integrityStatus.status === 'HEALTHY' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {integrityStatus.status}
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-2 flex items-center justify-end gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Next Scan in {nextCheckIn}s
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="text-blue-600" /> System Audit Logs
                    </h2>
                    <p className="text-gray-800 text-sm mt-1">Immutable record of all critical system events.</p>
                </div>
                <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-semibold"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-bold text-gray-800">{filteredLogs.length}</span> Total Events
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-800 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">User Identity</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map((log) => {
                                const style = getEventStyle(log.event);
                                const Icon = style.icon;
                                return (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: style.bg, color: style.color, borderColor: style.border }}>
                                                <Icon size={12} />
                                                {log.event.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">{log.user_id || '-'}</td>
                                        <td className="px-6 py-4 text-gray-800 text-sm">{log.ip_address}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-800 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
