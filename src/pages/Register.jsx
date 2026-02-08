import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { api } from '../utils/api';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        role: 'LIVE' // Defaulting simple system admin to LIVE role per requirements
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await api.register(formData);

            if (data.success) {
                navigate('/login');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Register new system administrator credentials."
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div className="rounded-md bg-red-50 p-3 border border-red-100 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-red-700 font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Full Name</label>
                        <input
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all placeholder-gray-400"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all placeholder-gray-400"
                            placeholder="jdoe_admin"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all placeholder-gray-400"
                        placeholder="admin@system.gov"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all placeholder-gray-400"
                        placeholder="Create strong password"
                    />
                    <p className="mt-1 text-xs text-gray-800">Must be at least 8 characters long.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933]"
                        style={{ backgroundColor: '#FF9933' }}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center">
                                <UserPlus className="h-4 w-4 mr-2 opacity-90" />
                                Register System Admin
                            </span>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-800">
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#000080' }} className="font-bold hover:underline transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;
