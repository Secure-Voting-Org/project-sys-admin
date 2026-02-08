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
            const res = await fetch(`http://${window.location.hostname}:8081/api/election/status`);
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
            const res = await fetch(`http://${window.location.hostname}:8081/api/election/update`, {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['PRE_POLL', 'VOTING', 'ENDED'].map((p) => (
                        <button
                            key={p}
                            onClick={() => updateSettings(p, undefined)}
                            disabled={loading}
                            className={`p-4 rounded-lg border-2 font-bold transition-all ${phase === p
                                ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 text-gray-800'
                                }`}
                        >
                            {p.replace('_', ' ')}
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
        </div>
    );
};

export default Settings;
