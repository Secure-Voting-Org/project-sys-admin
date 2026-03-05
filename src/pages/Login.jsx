import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { api } from '../utils/api';
import { LogIn, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'LIVE' // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await api.login(formData);

            if (data.success) {
                localStorage.setItem('sysadmin_token', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.admin));
                navigate('/');
            } else {
                setError(data.error || 'Access Denied: Invalid Credentials');
            }
        } catch (err) {
            setError('Secure Connection Failed. Retrying...');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Officer Login"
            subtitle="Authenticate with your government credentials."
        >
            <form className="space-y-7" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center shadow-lg shadow-red-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                        <span className="text-sm text-red-700 font-bold">{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-xs uppercase font-extrabold text-[#FF6B00] mb-2 tracking-widest pl-1">Officer ID / Username</label>
                        <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1 focus-within:scale-[1.01]">
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-5 pr-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933] outline-none transition-all text-gray-800 placeholder-gray-300 bg-white shadow-sm font-semibold text-lg"
                                placeholder="e.g. EC-ADMIN-01"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <div className="flex items-center justify-between mb-2 pl-1">
                            <label className="block text-xs uppercase font-extrabold text-[#008000] tracking-widest">Secure Password</label>
                            <Link to="/forgot-password" style={{ color: '#FF6B00' }} className="text-xs font-bold hover:text-[#d35400] hover:underline transition-colors decoration-2 underline-offset-2">
                                Forgot Access Key?
                            </Link>
                        </div>
                        <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1 focus-within:scale-[1.01]">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-5 pr-14 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#138808]/10 focus:border-[#138808] outline-none transition-all text-gray-800 placeholder-gray-300 bg-white shadow-sm font-semibold text-lg"
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-4 text-gray-300 hover:text-[#138808] transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group relative flex justify-center items-center py-4.5 px-6 border-0 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,107,0,0.5)] text-base font-black text-white overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(255,107,0,0.6)] hover:-translate-y-1 active:scale-[0.98] outline-none"
                        style={{
                            background: 'linear-gradient(135deg, #FF9933 0%, #FF6B00 50%, #FF4500 100%)',
                        }}
                    >
                        {/* Glossy sheen */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Shine Animation */}
                        <div className="absolute top-0 -inset-full h-full w-full z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine transition-all" />

                        {loading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                        ) : (
                            <span className="flex items-center gap-3 relative z-20 tracking-wide">
                                Verify & Access Dashboard
                                <Shield size={20} className="text-white fill-white/20" />
                            </span>
                        )}
                    </button>
                    <div className="mt-6 flex justify-center">
                        <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-800 font-bold uppercase tracking-wider">Secure Gateway Active</span>
                        </div>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
