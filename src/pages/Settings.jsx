import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, ShieldAlert } from 'lucide-react';

const Settings = () => {
    const [phase, setPhase] = useState('');
    const [killSwitch, setKillSwitch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:5001/api/election/status`);
            if (res.ok) {
                const data = await res.json();
                setPhase(data.phase);
                setKillSwitch(data.is_kill_switch_active);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newPhase, newKillSwitch) => {
        const payload = {};
        if (newPhase) payload.phase = newPhase;
        if (newKillSwitch !== undefined) payload.isKillSwitch = newKillSwitch;

        try {
            const res = await fetch(`http://${window.location.hostname}:5001/api/election/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Configuration updated successfully.' });
                // Optimistic update or refetch
                if (newPhase) setPhase(newPhase);
                if (newKillSwitch !== undefined) setKillSwitch(newKillSwitch);
            } else {
                setMessage({ type: 'error', text: 'Failed to update configuration.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' });
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Global System Settings</h2>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Election Phase Control</h3>
                <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${phase === 'LIVE' ? 'bg-green-100 border-green-300 text-green-900' :
                    phase === 'POST_POLL' ? 'bg-blue-100 border-blue-300 text-blue-900' :
                        'bg-gray-100 border-gray-300 text-gray-800'
                    }`}>
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-70">Current Phase</span>
                        <div className="text-2xl font-bold">
                            {phase === 'PRE_POLL' && 'PRE-POLL (REGISTRATION)'}
                            {phase === 'LIVE' && 'VOTING IS LIVE'}
                            {phase === 'POST_POLL' && 'ELECTION ENDED'}
                            {!['PRE_POLL', 'LIVE', 'POST_POLL'].includes(phase) && phase}
                        </div>
                    </div>
                    <div className="text-3xl">
                        {phase === 'LIVE' ? '🟢' : phase === 'POST_POLL' ? '🏁' : '📝'}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'PRE_POLL', label: 'PRE POLL' },
                        { id: 'LIVE', label: 'VOTING' },
                        { id: 'POST_POLL', label: 'ENDED' }
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => updateSettings(p.id, undefined)}
                            disabled={loading}
                            className={`p-4 rounded-lg border-2 font-bold transition-all ${phase === p.id
                                ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 text-gray-800'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-gray-800 mt-4">
                    <strong>PRE POLL:</strong> Registration open, Voting closed.<br />
                    <strong>VOTING:</strong> Registration closed, Voting open.<br />
                    <strong>ENDED:</strong> Voting closed, Results available.
                </p>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-800">Emergency Kill Switch</h3>
                        <p className="text-sm text-red-700 mb-4">
                            Immediately halts all voting processes, invalidates active sessions, and locks the database.
                            Use only in case of critical security breach.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateSettings(undefined, !killSwitch)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white transition-colors ${killSwitch ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 hover:bg-gray-500'
                                    }`}
                            >
                                {killSwitch ? 'SYSTEM HALTED' : 'ACTIVATE KILL SWITCH'}
                            </button>
                            {killSwitch && <span className="text-red-600 font-bold animate-pulse">SYSTEM IS CURRENTLY OFFLINE</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Drills Section */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 mt-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-orange-800">Security Drills (Testing)</h3>
                        <p className="text-sm text-orange-700 mb-4">
                            Tools to test and demonstrate system security features. These actions simulate real-world attacks.
                        </p>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`http://${window.location.hostname}:5001/api/admin/inject-fake-vote`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
                                            });
                                            if (res.ok) {
                                                setMessage({ type: 'success', text: 'Simulated Database Breach. Watchdog alert triggered.' });
                                            } else {
                                                setMessage({ type: 'error', text: 'Failed to simulate breach.' });
                                            }
                                            setTimeout(() => setMessage(null), 3000);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="self-start px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    Simulate Database Breach (Math Mismatch)
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`http://${window.location.hostname}:5001/api/admin/clear-fake-votes`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
                                            });
                                            if (res.ok) {
                                                setMessage({ type: 'success', text: 'Test data cleared! The Watchdog alarm should stop.' });
                                            } else {
                                                setMessage({ type: 'error', text: 'Failed to clear tests.' });
                                            }
                                            setTimeout(() => setMessage(null), 3000);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="self-start px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    Reset / Clear Test Data
                                </button>
                            </div>
                            <p className="text-xs text-orange-600 italic">Injects a fraudulent raw vote into the database directly. Use 'Reset' to stop the alarm after the demo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
