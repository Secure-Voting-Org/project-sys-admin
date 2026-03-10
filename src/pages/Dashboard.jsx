import React, { useState, useEffect } from 'react';
import { Users, Vote, AlertTriangle, Radio, TrendingUp, Building2, UserCheck, ArrowUp, Activity, Shield, Database, Server, CheckCircle, Copy, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config/api';
import { api } from '../utils/api';

const Widget = ({ title, value, icon, color, subtext, onClick, isAlert }) => (
    <div
        onClick={onClick}
        className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md group`}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
                <h3 className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-gray-800'}`}>{value}</h3>
                {subtext && <p className="text-xs text-gray-800 mt-2">{subtext}</p>}
            </div>
            <div className={`${color} p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
        {/* Hover Indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
);

const HealthItem = ({ label, status }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className={`text-xs font-bold ${status === 'Operational' ? 'text-green-700' : 'text-yellow-700'}`}>{status}</span>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeAdmins: 0,
        totalVoters: 0,
        votesCast: 0,
        securityIncidents: 0,
        blockchainNodes: 8, // Mocked for now
        systemUptime: '99.99%'
    });
    const [loading, setLoading] = useState(true);
    const [recentLogs, setRecentLogs] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState("");
    const [electionPhase, setElectionPhase] = useState('PRE_POLL');
    const [keyShares, setKeyShares] = useState(null);

    useEffect(() => {
        fetchDashboardData();

        // Establish Real-Time SSE Connection
        const token = localStorage.getItem('sysadmin_token');
        if (!token) return;
        
        const source = new EventSource(`${API_BASE}/api/audit/stream?token=${token}`);
        
        source.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'ping') return;
                
                // Add new log to recent activity
                setRecentLogs(prev => {
                    // avoid duplicates by ID
                    if (prev.some(l => l.id === data.id)) return prev;
                    return [data, ...prev].slice(0, 5);
                });
                
                // Check if it's a security alert
                const isAlert = data.event && (data.event.includes('FAILED') || data.event.includes('LOCKED') || data.event.includes('UNAUTHORIZED'));
                if (isAlert) {
                    setStats(prev => ({ ...prev, securityIncidents: prev.securityIncidents + 1 }));
                    setAlerts(prev => {
                        if (prev.some(a => a.id === data.id)) return prev;
                        return [
                            { id: data.id, type: 'critical', message: `${data.event} - ${data.user_id || 'Unknown'}`, time: new Date(data.created_at).toLocaleTimeString() },
                            ...prev
                        ].slice(0, 3);
                    });
                }
            } catch (err) {
                console.error("SSE parse error", err);
            }
        };

        return () => source.close();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const baseUrl = API_BASE;
            setDebugInfo(`Fetching from: ${baseUrl}`);

            // 1. Fetch Admins
            const headers = api.getHeaders();

            const adminsRes = await fetch(`${baseUrl}/api/admin/list`, { headers });
            if (!adminsRes.ok) {
                const errorData = await adminsRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Admins API Error: ${adminsRes.statusText}`);
            }
            const admins = await adminsRes.json();

            // 2. Fetch Voters & Calculate Stats
            const votersRes = await fetch(`${baseUrl}/api/admin/voters`, { headers });
            if (!votersRes.ok) {
                const errorData = await votersRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Voters API Error: ${votersRes.statusText}`);
            }
            const voters = await votersRes.json();
            const votesCast = Array.isArray(voters) ? voters.filter(v => v.has_voted).length : 0;

            // 3. Fetch Logs (Handle fail gracefully)
            let logs = [];
            try {
                const logsRes = await fetch(`${baseUrl}/api/audit/logs`, { headers });
                if (logsRes.ok) {
                    logs = await logsRes.json();
                } else {
                    console.error("Logs fetch failed:", logsRes.status);
                }
            } catch (logErr) {
                console.error("Logs fetch network error:", logErr);
            }

            // Filter critical alerts
            const securityIncidents = Array.isArray(logs) ? logs.filter(l =>
                l.event && (l.event.includes('FAILED') || l.event.includes('LOCKED') || l.event.includes('UNAUTHORIZED'))
            ) : [];

            const recentCritical = securityIncidents.slice(0, 3).map((l, i) => ({
                id: i, type: 'critical', message: `${l.event} - ${l.user_id || 'Unknown'}`, time: new Date(l.created_at).toLocaleTimeString()
            }));

            // 4. Fetch Election Phase and Keys
            let currentPhase = 'PRE_POLL';
            try {
                const phaseRes = await fetch(`${baseUrl}/api/election/status`, { headers });
                if (phaseRes.ok) {
                    const phaseData = await phaseRes.json();
                    currentPhase = phaseData.phase;
                    setElectionPhase(currentPhase);
                }
            } catch (err) {
                console.error("Failed to fetch election phase", err);
            }

            if (currentPhase === 'POST_POLL') {
                try {
                    const keysRes = await fetch(`${baseUrl}/api/sysadmin/election/keys`, { headers });
                    if (keysRes.ok) {
                        const keysData = await keysRes.json();
                        setKeyShares(keysData.shares);
                    }
                } catch (err) {
                    console.error("Failed to fetch key shares:", err);
                }
            }

            setStats({
                activeAdmins: Array.isArray(admins) ? admins.length : 0,
                totalVoters: Array.isArray(voters) ? voters.length : 0,
                votesCast: votesCast,
                securityIncidents: securityIncidents.length,
                blockchainNodes: 8,
                systemUptime: '99.98%'
            });

            setAlerts(recentCritical);
            setRecentLogs(Array.isArray(logs) ? logs.slice(0, 5) : []);

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Header Section */}
            <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
                        <p className="text-sm text-gray-500">Monitor system health, security, and integrity.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                        <Activity size={16} />
                        <span>System Status: OPERATIONAL</span>
                    </div>
                </div>



                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <p className="font-bold">Dashboard Error:</p>
                        <p>{error}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">Debug: {debugInfo}</p>
                    </div>
                )}
            </div>

            {/* Row 1: Key Metrics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Widget
                    title="Active Admins"
                    value={stats.activeAdmins}
                    icon={<Users className="text-white" size={20} />}
                    color="bg-[#000080] text-white"
                    onClick={() => navigate('/admins')}
                />
                <Widget
                    title="Votes Cast"
                    value={stats.votesCast}
                    subtext={`${((stats.votesCast / (stats.totalVoters || 1)) * 100).toFixed(1)}% Turnout`}
                    icon={<Vote className="text-white" size={20} />}
                    color="bg-[#138808]"
                    onClick={() => navigate('/users?filter=voted')}
                />
                <Widget
                    title="Security Incidents"
                    value={stats.securityIncidents}
                    icon={<Shield className="text-white" size={20} />}
                    color="bg-[#FF9933]"
                    isAlert={stats.securityIncidents > 0}
                    onClick={() => navigate('/audit-logs')}
                />
                <Widget
                    title="Blockchain Nodes"
                    value={`${stats.blockchainNodes} / 8`}
                    icon={<Database className="text-white" size={20} />}
                    color="bg-[#138808]"
                    subtext="All nodes synced"
                    onClick={() => navigate('/health')}
                />
            </div>

            {/* Row 2: Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: System Health & Security (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* System Health Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Server size={20} className="text-blue-600" />
                            Infrastructure Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <HealthItem label="API Gateway" status="Operational" />
                            <HealthItem label="Primary Database" status="Operational" />
                            <HealthItem label="Blockchain Network" status="Syncing" />
                            <HealthItem label="Identity Service" status="Operational" />
                        </div>
                    </div>

                    {/* Decryption Keys Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Key size={20} className={electionPhase === 'POST_POLL' ? 'text-green-600' : 'text-gray-400'} />
                            Election Decryption Keys
                        </h3>
                        {electionPhase !== 'POST_POLL' ? (
                            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                                <Shield className="mx-auto text-gray-400 mb-3" size={32} />
                                <p className="text-gray-600 font-medium">Keys are securely locked.</p>
                                <p className="text-sm text-gray-500 mt-1">Can only be accessed during the POST_POLL phase to ensure election integrity.</p>
                            </div>
                        ) : keyShares ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm mb-4 flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5" />
                                    <span>Distribute these shares to the authorized Election Officials for the Tally Ceremony. At least 3 shares are required to reconstruct the master decryption key.</span>
                                </div>
                                {Object.entries(keyShares || {}).map(([official, key], idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-gray-700">{official}</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={key} 
                                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 font-mono"
                                            />
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(key)}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-red-500">Failed to load decryption keys. Please check server logs.</div>
                        )}
                    </div>

                    {/* Security Alerts Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-600" />
                            Security Alerts
                        </h3>
                        {alerts.length > 0 ? (
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'} flex items-start gap-3`}>
                                        <AlertTriangle size={18} className={alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{alert.message}</p>
                                            <p className="text-xs text-gray-800 mt-1">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                                <CheckCircle size={18} />
                                No active security alerts.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Recent Activity (1/3 width) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={18} className="text-gray-800" />
                            Recent Activity
                        </h3>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-800">Live</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="text-center text-gray-800 py-8 text-sm">Loading logs...</div>
                        ) : recentLogs.length > 0 ? (
                            recentLogs.map((log, idx) => (
                                <div key={idx} className="flex gap-3 text-sm pb-3 border-b border-gray-50 last:border-0">
                                    <div className="mt-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-100"></div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{log?.event?.replace(/_/g, ' ') || 'Unknown Event'}</div>
                                        <div className="text-xs text-gray-800 font-mono mt-1">{log?.user_id || 'System'}</div>
                                        <div className="text-xs text-gray-800 mt-1">{log?.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8 text-sm">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button onClick={() => navigate('/audit-logs')} className="text-blue-600 text-sm font-semibold hover:underline">View All Logs</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
