import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Save, ShieldAlert, Database, Download, RotateCcw, Loader } from 'lucide-react';
import API_BASE from '../config/api';
import { api } from '../utils/api';

const Settings = () => {
    const [phase, setPhase] = useState('');
    const [killSwitch, setKillSwitch] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // Password change state
    const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
    const [pwdLoading, setPwdLoading] = useState(false);
    // Backup state
    const [backups, setBackups] = useState([]);
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupMsg, setBackupMsg] = useState(null);

    const fetchBackups = async () => {
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/sysadmin/backup/list`, { headers });
            const data = await res.json();
            if (data.success) setBackups(data.backups || []);
        } catch {}
    };

    const triggerBackup = async () => {
        setBackupLoading(true);
        setBackupMsg(null);
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/sysadmin/backup/trigger`, { method: 'POST', headers });
            const data = await res.json();
            if (data.success) {
                setBackupMsg({ type: 'success', text: `✅ Backup created: ${data.backup.filename}` });
                fetchBackups();
            } else throw new Error(data.error);
        } catch (e) {
            setBackupMsg({ type: 'error', text: `❌ ${e.message}` });
        } finally {
            setBackupLoading(false);
        }
    };

    const restoreBackup = async (filename) => {
        if (!window.confirm(`Are you sure you want to RESTORE from ${filename}? This will overwrite the current database!`)) return;
        setBackupLoading(true);
        try {
            const headers = { ...api.getHeaders(), 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE}/api/sysadmin/backup/restore`, { method: 'POST', headers, body: JSON.stringify({ filename }) });
            const data = await res.json();
            if (data.success) setBackupMsg({ type: 'success', text: `✅ Restored from ${filename}` });
            else throw new Error(data.error);
        } catch (e) {
            setBackupMsg({ type: 'error', text: `❌ ${e.message}` });
        } finally {
            setBackupLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/election/status`);
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

    const startNewElection = async () => {
        if (!window.confirm("WARNING: This will permanently wipe all current non-archived vote data, reset everyone's 'has_voted' status, and delete the cryptographic keys. Are you SURE you want to Start a New Election?")) return;
        setLoading(true);
        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/admin/election/reset`, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Election successfully reset to PRE-POLL state.' });
                setPhase('PRE_POLL');
            } else {
                setMessage({ type: 'error', text: 'Failed to reset election.' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Reset request failed.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const updateSettings = async (newPhase, newKillSwitch) => {
        const payload = {};
        if (newPhase) payload.phase = newPhase;
        if (newKillSwitch !== undefined) payload.isKillSwitch = newKillSwitch;

        try {
            const headers = api.getHeaders();
            const res = await fetch(`${API_BASE}/api/election/update`, {
                method: 'POST',
                headers,
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdLoading(true);
        if (pwdForm.new !== pwdForm.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            setPwdLoading(false);
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/sysadmin/change-password`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.new })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully.' });
                setPwdForm({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setPwdLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Reset / New Election Button */}
                    {phase === 'POST_POLL' ? (
                        <button
                            onClick={startNewElection}
                            disabled={loading}
                            className="p-4 rounded-lg border-2 font-bold transition-all border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                        >
                            🔄 START NEW ELECTION
                        </button>
                    ) : (
                        <button
                            disabled={true}
                            className="p-4 rounded-lg font-bold transition-all border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                            PRE POLL (Locked)
                        </button>
                    )}

                    {/* Go Live Button */}
                    <button
                        onClick={() => updateSettings('LIVE', undefined)}
                        disabled={loading || phase === 'LIVE' || phase === 'POST_POLL'}
                        className={`p-4 rounded-lg border-2 font-bold transition-all ${phase === 'LIVE'
                            ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                            : phase === 'POST_POLL' ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-blue-300 hover:border-blue-400 text-blue-700 bg-blue-50'
                            }`}
                    >
                        VOTING (LIVE)
                    </button>

                    {/* Post Poll Button */}
                    <button
                        onClick={() => updateSettings('POST_POLL', undefined)}
                        disabled={loading || phase === 'POST_POLL'}
                        className={`p-4 rounded-lg border-2 font-bold transition-all ${phase === 'POST_POLL'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-orange-300 hover:border-orange-400 text-orange-700 bg-orange-50'
                            }`}
                    >
                        ENDED (POST POLL)
                    </button>
                </div>
                <p className="text-sm text-gray-800 mt-4">
                    <strong>PRE POLL:</strong> Registration open, Voting closed.<br />
                    <strong>VOTING:</strong> Registration closed, Voting open.<br />
                    <strong>ENDED:</strong> Voting closed, Results available.
                </p>
            </div>

            {/* Admin Password Change */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Update Master Password</h3>
                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Current Password</label>
                        <input type="password" required value={pwdForm.current} onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">New Password</label>
                        <input type="password" required value={pwdForm.new} onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Confirm New Password</label>
                        <input type="password" required value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-3">
                        <button type="submit" disabled={pwdLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors">
                            {pwdLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-200 mt-6">
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
                                            const headers = api.getHeaders();
                                            const res = await fetch(`${API_BASE}/api/admin/inject-fake-vote`, {
                                                method: 'POST',
                                                headers
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
                                            const headers = api.getHeaders();
                                            const res = await fetch(`${API_BASE}/api/admin/clear-fake-votes`, {
                                                method: 'POST',
                                                headers
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

            {/* ── Backup & Recovery ─────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><Database size={20} className="text-blue-600" /></div>
                        <div>
                            <h3 className="font-bold text-gray-800">Database Backup & Recovery</h3>
                            <p className="text-sm text-gray-500">Create and restore database snapshots</p>
                        </div>
                    </div>
                    <button onClick={() => { fetchBackups(); }} className="text-sm text-blue-600 underline">Refresh list</button>
                </div>

                {backupMsg && (
                    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${backupMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {backupMsg.text}
                    </div>
                )}

                <button
                    onClick={triggerBackup}
                    disabled={backupLoading}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mb-4"
                >
                    {backupLoading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                    Create Backup Now
                </button>

                {backups.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600">Available Backups ({backups.length})</p>
                        {backups.map(b => (
                            <div key={b.filename} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-sm font-mono text-gray-700">{b.filename}</p>
                                    <p className="text-xs text-gray-400">{b.sizeHuman} · {new Date(b.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => restoreBackup(b.filename)}
                                    disabled={backupLoading}
                                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                                >
                                    <RotateCcw size={13} /> Restore
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">No backups yet. Click "Create Backup Now" to create the first snapshot.</p>
                )}
            </div>
        </div>
    );
};

export default Settings;
