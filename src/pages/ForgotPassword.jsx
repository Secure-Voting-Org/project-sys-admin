import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { api } from '../utils/api';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await api.sendOtp(email);
            if (data.success) {
                setStep(2);
                setSuccessMessage(data.message);
            } else {
                setError(data.error || 'Account not found');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await api.verifyOtp(email, otp);
            if (data.success) {
                setStep(3);
                setSuccessMessage('OTP Verified. Please set a new secure password.');
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await api.resetPassword(email, otp, newPassword);
            if (data.success) {
                setSuccessMessage('Password successfully updated. redirecting to secure login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.error || 'Reset failed');
            }
        } catch (err) {
            setError('Reset failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recover Access"
            subtitle={step === 1 ? "Verify identity via official email." : step === 2 ? "Enter the 6-digit security code." : "Establish new security credentials."}
        >
            {error && (
                <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-center shadow-lg shadow-red-100/50">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-bold">{error}</span>
                </div>
            )}

            {successMessage && !error && (
                <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-100 flex items-center shadow-lg shadow-green-100/50">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-bold">{successMessage}</span>
                </div>
            )}

            <div className="mt-4 space-y-6">
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs uppercase font-extrabold text-[#FF6B00] mb-2 tracking-widest pl-1">Official Email Address</label>
                            <div className="relative focus-within:transform focus-within:-translate-y-1 transition-all duration-300">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-5 pr-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933] outline-none transition-all text-gray-800 font-semibold text-lg bg-white shadow-sm"
                                    placeholder="officer@eci.gov.in"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl text-base font-black text-white shadow-[0_10px_30px_-10px_rgba(255,107,0,0.5)] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(255,107,0,0.6)] hover:-translate-y-1 active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #FF9933 0%, #FF6B00 100%)' }}
                        >
                            {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : 'Send Verification OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="text-center">
                            <label className="block text-xs uppercase font-extrabold text-[#008000] mb-3 tracking-widest">One-Time Password</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#138808]/10 focus:border-[#138808] outline-none text-center tracking-[0.75em] text-3xl font-black text-[#138808] bg-gray-50 uppercase shadow-inner"
                                placeholder="••••••"
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl text-base font-black text-white shadow-[0_10px_30px_-10px_rgba(0,128,0,0.5)] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,128,0,0.6)] hover:-translate-y-1 active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #138808 0%, #006400 100%)' }}
                        >
                            {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : 'Verify OTP Code'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-xs font-bold text-gray-800 hover:text-[#1a237e] transition-colors uppercase tracking-wider"
                        >
                            Start Over
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs uppercase font-extrabold text-[#1a237e] mb-2 tracking-widest pl-1">New Secure Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-5 pr-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#1a237e]/10 focus:border-[#1a237e] outline-none transition-all text-gray-800 font-semibold text-lg bg-white shadow-sm"
                                placeholder="Enter strong password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl text-base font-black text-white shadow-[0_10px_30px_-10px_rgba(26,35,126,0.5)] transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(26,35,126,0.6)] hover:-translate-y-1 active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #1a237e 0%, #000051 100%)' }}
                        >
                            {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : 'Update Credentials'}
                        </button>
                    </form>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                <Link to="/login" className="inline-flex items-center text-xs font-extrabold text-[#1a237e] hover:text-[#FF6B00] transition-colors tracking-widest uppercase group">
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Return to Secure Login
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
