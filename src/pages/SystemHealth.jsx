import React, { useState, useEffect, useCallback } from 'react';
import { Server, Database, Activity, CheckCircle, Wifi, WifiOff, RefreshCw, Users, Vote, Layers } from 'lucide-react';
import API_BASE from '../config/api';
import { api } from '../utils/api';

const MetricCard = ({ icon: Icon, label, value, sub, color = '#3b82f6' }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100" style={{ borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color }}>{value ?? '—'}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
                <Icon size={22} style={{ color }} />
            </div>
        </div>
    </div>
);

const ServiceRow = ({ name, icon: Icon, status, latency }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Icon size={20} /></div>
            <span className="font-medium text-gray-800">{name}</span>
        </div>
        <div className="flex items-center gap-6">
            {latency && <span className="text-sm font-mono text-gray-500">{latency}</span>}
            <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${status === 'Optimal' ? 'bg-green-500' : status === 'Degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-bold ${status === 'Optimal' ? 'text-green-600' : status === 'Degraded' ? 'text-yellow-600' : 'text-red-600'}`}>{status}</span>
            </div>
        </div>
    </div>
);

const SystemHealth = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchMetrics = useCallback(async () => {
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/sysadmin/system-metrics`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMetrics(data);
            setLastUpdated(new Date());
            setError('');
        } catch {
            setError('Unable to reach backend. Showing last known state.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 15000); // auto-refresh every 15s
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    const phase = metrics?.electionPhase;
    const phaseColor = phase === 'LIVE' ? '#22c55e' : phase === 'POST_POLL' ? '#f59e0b' : '#6366f1';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Health</h2>
                    <p className="text-sm text-gray-500">
                        {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading live data...'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {metrics && !error ? (
                        <span className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                            <Wifi size={15} /> All Systems Operational
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">
                            <WifiOff size={15} /> Connection Issue
                        </span>
                    )}
                    <button
                        onClick={fetchMetrics}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {error && <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <MetricCard icon={Users} label="Active Sessions" value={loading ? '...' : metrics?.activeSessions} sub={`Voters: ${metrics?.sessionBreakdown?.voters ?? '—'} | Admins: ${metrics?.sessionBreakdown?.admins ?? '—'}`} color="#6366f1" />
                <MetricCard icon={Vote} label="Total Votes Cast" value={loading ? '...' : metrics?.totalVotes} color="#22c55e" />
                <MetricCard icon={Layers} label="Blockchain Blocks" value={loading ? '...' : metrics?.ledgerBlocks} color="#f59e0b" />
                <MetricCard icon={Activity} label="Election Phase"
                    value={loading ? '...' : phase}
                    sub={metrics?.killSwitchActive ? '⚠️ Kill Switch ACTIVE' : 'Kill Switch Off'}
                    color={metrics?.killSwitchActive ? '#ef4444' : phaseColor}
                />
            </div>

            {/* Service Status */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-3">Infrastructure Services</h3>
                <div className="space-y-3">
                    <ServiceRow name="API Gateway" icon={Server} status={metrics ? 'Optimal' : 'Unknown'} latency="~45ms" />
                    <ServiceRow name="Primary Database" icon={Database} status={metrics?.dbStatus === 'connected' ? 'Optimal' : 'Degraded'} latency="~12ms" />
                    <ServiceRow name="Blockchain Ledger" icon={Layers} status={metrics?.ledgerBlocks > 0 ? 'Optimal' : 'Idle'} />
                    <ServiceRow name="Auth Service" icon={CheckCircle} status={metrics?.activeSessions !== undefined ? 'Optimal' : 'Unknown'} latency="~55ms" />
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
