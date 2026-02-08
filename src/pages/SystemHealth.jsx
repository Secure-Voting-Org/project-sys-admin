import React, { useState } from 'react';
import { Server, Database, Activity, CheckCircle, Wifi } from 'lucide-react';

const SystemHealth = () => {
    // In a real app, fetch these from /api/health endpoint
    const [stats] = useState([
        { name: 'API Gateway', status: 'Optimal', latency: '45ms', uptime: '99.99%', icon: Server },
        { name: 'Primary Database', status: 'Optimal', latency: '12ms', uptime: '99.95%', icon: Database },
        { name: 'Blockchain Node 1', status: 'Syncing', latency: '120ms', uptime: '98.50%', icon: Activity },
        { name: 'Blockchain Node 2', status: 'Optimal', latency: '115ms', uptime: '98.40%', icon: Activity },
        { name: 'Auth Service', status: 'Optimal', latency: '55ms', uptime: '99.98%', icon: CheckCircle },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Health</h2>
                    <p className="text-gray-800 text-sm">Real-time infrastructure monitoring.</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                    <Wifi size={16} />
                    All Systems Operational
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-800">Uptime: {item.uptime}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-sm text-gray-800">Latency</p>
                                <p className="font-mono font-semibold text-gray-800">{item.latency}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-800">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${item.status === 'Optimal' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                    <span className={`font-bold ${item.status === 'Optimal' ? 'text-green-600' : 'text-yellow-600'}`}>{item.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemHealth;
