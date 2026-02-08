import React, { useState, useEffect } from 'react';
import { Users, Vote, AlertTriangle, Radio, TrendingUp, Building2, UserCheck, ArrowUp, Activity, Shield, Database, Server, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LifecycleController from '../components/LifecycleController';

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
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const baseUrl = `http://${window.location.hostname}:8081`;
            setDebugInfo(`Fetching from: ${baseUrl}`);

            // 1. Fetch Admins
            const adminsRes = await fetch(`${baseUrl}/api/admin/list`);
            if (!adminsRes.ok) throw new Error(`Admins API Error: ${adminsRes.statusText}`);
            const admins = await adminsRes.json();

            // 2. Fetch Voters & Calculate Stats
            const votersRes = await fetch(`${baseUrl}/api/admin/voters`);
            if (!votersRes.ok) throw new Error(`Voters API Error: ${votersRes.statusText}`);
            const voters = await votersRes.json();
            const votesCast = Array.isArray(voters) ? voters.filter(v => v.has_voted).length : 0;

            // 3. Fetch Logs (Handle fail gracefully)
            let logs = [];
            try {
                const logsRes = await fetch(`${baseUrl}/api/audit/logs`);
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

    // Alert state definition was missing in previous snippet? Checking history.
    // Wait, in step 640 view_file: const [alerts, setAlerts] = useState([]); WAS present at line 17.
    // But in the replacement/refactor (step 660), I might have lost it? 
    // Step 660 modifies fetchDashboardData but doesn't show useState section.
    // Step 701 view_file shows line 17: const [error, setError] = useState(null); 
    // Wait... look at lines 15-18 in Step 701:
    // 15: const [loading, setLoading] = useState(true);
    // 16: const [recentLogs, setRecentLogs] = useState([]);
    // 17: const [error, setError] = useState(null);
    // 18: const [debugInfo, setDebugInfo] = useState("");
    // WHERE IS [alerts, setAlerts]? 
    // It seems "alerts" state was accidentally removed when I added "error" state in Step 660 or confused the diff.
    // The previous state was:
    // const [recentLogs, setRecentLogs] = useState([]);
    // const [alerts, setAlerts] = useState([]);
    // Step 660 diff:
    // - const [alerts, setAlerts] = useState([]);
    // + const [error, setError] = useState(null);
    // + const [debugInfo, setDebugInfo] = useState("");
    //
    // CRITICAL FINDING: I DELETED `alerts` state! This caused another ReferenceError crash in the JSX where `alerts.length` is accessed.

    const [alerts, setAlerts] = useState([]); // Restoring this!

    return (
        <div className="space-y-6 font-sans">
<<<<<<< HEAD

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>

            <LifecycleController />

    {/* Row 1: Top Stats Cards */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
            title="Total Voters"
            value="95 Crores"
            trend="Trend = 95 Crores"
            icon={<Users className="text-white" size={20} />}
            color="bg-[#138808]" // Green
            trendValue={true}
        />
        <StatsCard
            title="Polling Stations"
            value="1.2 Lakhs"
            trend="Trend = 1,200"
            icon={<Building2 className="text-white" size={20} />}
            color="bg-[#000080]" // Blue
        />
        <StatsCard
            title="Candidates"
            value="8,500"
            trend="Trend - 6,500"
            icon={<AlertTriangle className="text-white" size={20} />}
            color="bg-[#FF9933]" // Orange
        />
        <StatsCard
            title="Election Status"
            value="Live"
            subtext="Blinking Status Live"
            icon={<Radio className="text-white animate-pulse" size={20} />}
            color="bg-[#138808]" // Green
            isStatus={true}
        />
    </div>

    {/* Row 2: Left Stats Column & Right Chart */ }
    <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column Vertical Stats */}
        <div className="w-full lg:w-1/4 space-y-4">
            {/* Stat Item 1 */}
            <SideStatCard
                title="Polling Stations"
                value="1.2K Lakhs"
                trend="Trend = 1.2 Lakhs"
                icon={<Building2 className="text-white" size={18} />}
                color="bg-[#000080]"
            />

            {/* Stat Item 2 */}
            <SideStatCard
                title="Candidates"
                value="8,500"
                trend="Trend > 8,500"
                icon={<AlertTriangle className="text-white" size={18} />}
                color="bg-[#FF9933]"
            />

            {/* Stat Item 3 */}
            <SideStatCard
                title="Polling Stations"
                value="1.2 Lakhs"
                trend="Trend > 1.2 Lakhs"
                icon={<Building2 className="text-white" size={18} />}
                color="bg-[#138808]"
            />
=======
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
>>>>>>> origin/main
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
