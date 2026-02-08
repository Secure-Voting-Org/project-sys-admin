import React from 'react';
import { Bell, ChevronDown, User, LogOut } from 'lucide-react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 shadow-md">
            {/* Top Saffron Band */}
            <div className="h-4 bg-[#FF9933]"></div>

            {/* Middle White Band with Content */}
            <div className="bg-white h-16 px-6 flex items-center justify-between relative">

                {/* Left: Empty spacer for balance */}
                <div className="flex items-center gap-3">
                </div>

                {/* Center: Emblem, Title & Ashoka Chakra */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-4">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/40px-Emblem_of_India.svg.png"
                        alt="Logo"
                        className="h-8 w-auto"
                    />
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-wide uppercase">
                        ELECTION COMMISSION ADMIN
                    </h1>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/60px-Ashoka_Chakra.svg.png"
                        alt="Ashoka Chakra"
                        className="h-10 w-10 animate-spin-slow"
                    />
                </div>

                {/* Right: User Profile */}
                <div className="flex items-center gap-6">
                    <div className="relative cursor-pointer text-gray-800 hover:text-[#FF9933] transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#FF9933] ring-2 ring-white transform translate-x-1/2 -translate-y-1/2"></span>
                    </div>

                    <div className="flex items-center gap-3 cursor-pointer group relative">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 overflow-hidden">
                                <User size={20} />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-gray-800">Andatan</span>
                                <ChevronDown size={16} className="text-gray-800" />
                            </div>
                        </div>

                        {/* Logout Dropdown */}
                        <div className="absolute top-full right-0 mt-0 pt-2 w-48 hidden group-hover:block">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                                <button
                                    onClick={async () => {
                                        try {
                                            // Get admin info from localStorage before clearing
                                            const adminUser = localStorage.getItem('adminUser');
                                            if (adminUser) {
                                                const admin = JSON.parse(adminUser);
                                                // Log logout event
                                                await fetch(`http://${window.location.hostname}:8081/api/admin/logout`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        username: admin.username,
                                                        role: admin.role
                                                    })
                                                });
                                            }
                                        } catch (err) {
                                            console.error('Logout logging failed:', err);
                                        }
                                        // Clear session and redirect
                                        localStorage.clear();
                                        window.location.href = '/login';
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Green Band */}
            <div className="h-4 bg-[#138808]"></div>
        </header>
    );
};

export default Header;
