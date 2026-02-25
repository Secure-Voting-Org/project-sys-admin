import React, { useState, useEffect, useRef } from 'react';
import { Activity, Users, Zap, AlertTriangle, Server, Database, Shield, Clock, Cpu, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';

// Mini sparkline chart component (pure CSS/SVG, no external libraries)
const Sparkline = ({ data = [], color = '#3B82F6', height = 60, alert = false }) => {
    if (data.length < 2) return <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">Collecting data...</div>;
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 85}`).join(' ');
    const fillPoints = `0,100 ${points} 100,100`;
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }} className="rounded">
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={fillPoints} fill={`url(#grad-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={alert ? '#EF4444' : color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
    );
};

const PerformanceDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const intervalRef = useRef(null);

    const fetchData = async () => {
        try {
            const [mRes, hRes] = await Promise.all([
                fetch('/api/metrics'),
                fetch('/api/metrics/health')
            ]);
            const mData = await mRes.json();
            const hData = await hRes.json();
            setMetrics(mData);
            setHealth(hData);
            setLastUpdated(new Date());
            setLoading(false);

            // Check for alerts (5.3.3.1)
            const newAlerts = [];
            if (mData.performance.errorsPerMin > 5) {
                newAlerts.push({ type: 'ERROR_RATE', message: `High error rate detected: ${mData.performance.errorsPerMin} errors/min` });
            }
            if (hData.overall === 'DEGRADED') {
                const downServices = Object.entries(hData.services).filter(([, v]) => v.status === 'DOWN').map(([k]) => k);
                newAlerts.push({ type: 'SERVICE_DOWN', message: `Service outage: ${downServices.join(', ')} — Immediate attention required` });
            }
            setAlerts(newAlerts);
        } catch (err) {
            setAlerts([{ type: 'CONNECTIVITY', message: 'Cannot reach backend API — monitoring interrupted' }]);
        }
    };

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 3000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const formatUptime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const phaseColors = {
        'PRE_POLL': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
        'LIVE': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
        'POST_POLL': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-500' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw size={40} className="animate-spin text-[#FF9933] mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Connecting to metrics engine...</p>
                </div>
            </div>
        );
    }

    const pc = phaseColors[metrics?.election?.phase] || phaseColors['PRE_POLL'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 size={28} className="text-[#FF9933]" />
                        Election Control Room
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time system performance monitoring — Auto-refreshes every 3 seconds</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Election Phase Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${pc.bg} ${pc.text} border ${pc.border}`}>
                        <div className={`h-2.5 w-2.5 rounded-full ${pc.dot} ${metrics?.election?.phase === 'LIVE' ? 'animate-pulse' : ''}`}></div>
                        {metrics?.election?.phase?.replace('_', ' ')}
                    </div>
                    {lastUpdated && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Alert Banners (5.3.3.1) */}
            {alerts.map((alert, idx) => (
                <div key={idx} className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                    <div className="bg-red-500 text-white rounded-full p-2">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-red-700">⚠️ ALERT: {alert.type.replace('_', ' ')}</div>
                        <div className="text-red-600 text-sm">{alert.message}</div>
                    </div>
                </div>
            ))}

            {/* Row 1: Key Election Metrics */}
            <div className="grid grid-cols-4 gap-4">
                {/* Voter Turnout */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF9933] opacity-5 rounded-bl-full"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <Users size={16} className="text-[#FF9933]" /> Voter Turnout
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800">{metrics?.election?.turnoutPercent || '0.0'}%</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {metrics?.election?.totalVotesCast || 0} of {metrics?.election?.totalRegisteredVoters || 0} voters
                    </div>
                    {/* Turnout bar */}
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(parseFloat(metrics?.election?.turnoutPercent || 0), 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Votes/Sec */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#138808] opacity-5 rounded-bl-full"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <Zap size={16} className="text-[#138808]" /> Votes/Sec
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800">{metrics?.performance?.votesPerSec || '0.00'}</div>
                    <div className="text-xs text-gray-400 mt-1">Last 30 seconds avg</div>
                    <div className="mt-2">
                        <Sparkline data={metrics?.timeSeries?.votes || []} color="#138808" height={40} />
                    </div>
                </div>

                {/* Active Connections */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-5 rounded-bl-full"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <Activity size={16} className="text-blue-500" /> Active Connections
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800">{metrics?.performance?.activeConnections || 0}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        Total requests: {metrics?.performance?.totalRequests?.toLocaleString() || 0}
                    </div>
                    <div className="mt-2">
                        <Sparkline data={metrics?.timeSeries?.requests || []} color="#3B82F6" height={40} />
                    </div>
                </div>

                {/* Error Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-5 rounded-bl-full"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <AlertTriangle size={16} className="text-red-500" /> Error Rate
                    </div>
                    <div className={`text-3xl font-extrabold ${(metrics?.performance?.errorsPerMin || 0) > 5 ? 'text-red-600' : 'text-gray-800'}`}>
                        {metrics?.performance?.errorsPerMin || 0}<span className="text-lg font-medium text-gray-400">/min</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Total errors: {metrics?.performance?.totalErrors || 0}
                    </div>
                    <div className="mt-2">
                        <Sparkline data={metrics?.timeSeries?.errors || []} color="#EF4444" height={40} alert={(metrics?.performance?.errorsPerMin || 0) > 5} />
                    </div>
                </div>
            </div>

            {/* Row 2: Infrastructure Health + System Resources */}
            <div className="grid grid-cols-3 gap-4">
                {/* Service Health Panel */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Shield size={18} className="text-[#FF9933]" /> Infrastructure Health
                        </h3>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${health?.overall === 'OPERATIONAL' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {health?.overall || 'CHECKING...'}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {health?.services && Object.entries(health.services).map(([name, info]) => (
                            <div key={name} className={`rounded-lg p-4 border ${info.status === 'UP' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {name === 'database' && <Database size={18} className={info.status === 'UP' ? 'text-green-600' : 'text-red-600'} />}
                                    {name === 'api' && <Server size={18} className={info.status === 'UP' ? 'text-green-600' : 'text-red-600'} />}
                                    {name === 'blockchain' && <Shield size={18} className={info.status === 'UP' ? 'text-green-600' : 'text-red-600'} />}
                                    <span className="font-bold text-sm text-gray-700 capitalize">{name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-2.5 w-2.5 rounded-full ${info.status === 'UP' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className={`text-sm font-semibold ${info.status === 'UP' ? 'text-green-700' : 'text-red-700'}`}>{info.status}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {info.latencyMs >= 0 ? `${info.latencyMs}ms` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Resources */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Cpu size={18} className="text-[#FF9933]" /> System Resources
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Memory Usage</span>
                                <span className="font-mono font-semibold text-gray-700">
                                    {metrics?.system?.memoryUsedMB || 0} / {metrics?.system?.memoryTotalMB || 0} MB
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${metrics?.system?.memoryTotalMB ? ((metrics.system.memoryUsedMB / metrics.system.memoryTotalMB) * 100).toFixed(0) : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Avg Response Time</span>
                                <span className="font-mono font-semibold text-gray-700">{metrics?.performance?.avgResponseTimeMs || 0}ms</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${(metrics?.performance?.avgResponseTimeMs || 0) > 200 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}
                                    style={{ width: `${Math.min((metrics?.performance?.avgResponseTimeMs || 0) / 5, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Uptime</span>
                                <span className="font-mono font-semibold text-green-600">{formatUptime(metrics?.system?.uptimeSeconds || 0)}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Node.js</span>
                                <span className="font-mono text-gray-500 text-xs">{metrics?.system?.nodeVersion || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Constituency Turnout Table */}
            {metrics?.election?.constituencyTurnout?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-[#FF9933]" /> Constituency-wise Turnout
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600">
                                    <th className="text-left py-2 px-4 rounded-l-lg font-semibold">Constituency</th>
                                    <th className="text-center py-2 px-4 font-semibold">Registered</th>
                                    <th className="text-center py-2 px-4 font-semibold">Votes Cast</th>
                                    <th className="text-center py-2 px-4 font-semibold">Turnout %</th>
                                    <th className="text-left py-2 px-4 rounded-r-lg font-semibold">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.election.constituencyTurnout.map((ct, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-700">{ct.constituency}</td>
                                        <td className="py-3 px-4 text-center text-gray-500">{ct.registered}</td>
                                        <td className="py-3 px-4 text-center font-semibold text-gray-700">{ct.votes}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-bold ${parseFloat(ct.turnout) > 60 ? 'text-green-600' : parseFloat(ct.turnout) > 30 ? 'text-[#FF9933]' : 'text-red-500'}`}>
                                                {ct.turnout}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4" style={{ minWidth: '150px' }}>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(parseFloat(ct.turnout), 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Row 4: Recent Errors */}
            {metrics?.recentErrors?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} className="text-red-500" /> Recent Errors
                    </h3>
                    <div className="space-y-2">
                        {metrics.recentErrors.map((err, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg text-sm">
                                <span className="text-red-400 text-xs font-mono whitespace-nowrap">
                                    {new Date(err.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="font-medium text-gray-600">{err.path}</span>
                                <span className="text-red-600">{err.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceDashboard;
