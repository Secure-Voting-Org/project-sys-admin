import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">

            {/* Background Decor: Luminous Glows */}
            <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-[#FF9933]/20 blur-[100px] mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] rounded-full bg-[#138808]/20 blur-[100px] mix-blend-multiply"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/40 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-white/50 relative z-10 transition-all duration-500 hover:shadow-[0_30px_70px_-15px_rgba(255,153,51,0.15)] ring-1 ring-white/60">

                {/* Left Side: Premium Branding - Vibrant Tricolor Gradient with Glass */}
                <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#FF8C00] via-[#ffffff] to-[#00A000] text-[#000080] flex flex-col justify-between p-10 lg:p-14 relative overflow-hidden group">

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/40 mix-blend-overlay"></div>
                    {/* White overlay to ensure text readability on the vivid gradient */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>

                    {/* Header */}
                    <div className="relative z-10 flex items-center gap-4">
                        <img
                            src={logo}
                            alt="TrustBallot Logo"
                            style={{ height: '80px', width: 'auto', background: 'white', borderRadius: '12px', padding: '5px' }}
                            className="shadow-xl"
                        />
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-[#1a237e] drop-shadow-sm">
                                TrustBallot
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="h-1 w-5 bg-gradient-to-r from-[#FF9933] to-[#FF8C00] rounded-full shadow-sm"></div>
                                <div className="h-1 w-5 bg-white border border-gray-100 rounded-full shadow-sm"></div>
                                <div className="h-1 w-5 bg-gradient-to-r from-[#138808] to-[#006400] rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 my-8 lg:my-0 space-y-8">
                        <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E65100] drop-shadow-sm">Bharat</span> <br />
                            <span className="text-[#1a237e]">Election</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008000] to-[#004d00] drop-shadow-sm">Control</span>
                        </h2>

                        <div className="relative pl-6 border-l-4 border-[#1a237e]/20">
                            <p className="text-lg text-[#1a237e]/90 font-medium leading-relaxed">
                                The supreme administrative console for managing the world's largest democratic exercise.
                            </p>
                            <div className="mt-3 flex gap-3 text-sm font-bold text-[#1a237e]/70">
                                <span>Secure</span>
                                <span>Transparent</span>
                                <span>Sovereign</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Tag */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg ring-1 ring-white/50">
                            <Lock size={14} className="text-[#E65100]" />
                            <span className="text-[11px] font-bold tracking-wider text-[#1a237e] uppercase">Top Secret Clearance</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Area - Lighter & cleaner */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-24 bg-white/60 relative">

                    <div className="w-full max-w-md mx-auto relative z-10">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-[#1a237e] tracking-tight font-sans">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-3 text-base text-slate-600 font-medium">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {children}

                        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col items-center gap-3">
                            <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
                                Powered by Election Commission of India
                            </p>
                            <div className="flex gap-2 opacity-80">
                                <div className="w-2 h-2 rounded-full bg-[#FF9933] shadow-sm"></div>
                                <div className="w-2 h-2 rounded-full bg-white border border-gray-300 shadow-sm"></div>
                                <div className="w-2 h-2 rounded-full bg-[#138808] shadow-sm"></div>
                                <div className="w-2 h-2 rounded-full bg-[#000080] shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
