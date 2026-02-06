import React from 'react';
import { Bell, ChevronDown, User } from 'lucide-react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 shadow-md">
            {/* Top Saffron Band */}
            <div className="h-4 bg-[#FF9933]"></div>

            {/* Middle White Band with Content */}
            <div className="bg-white h-16 px-6 flex items-center justify-between relative">

                {/* Left: Logo & Title */}
                <div className="flex items-center gap-3">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/40px-Emblem_of_India.svg.png"
                        alt="Logo"
                        className="h-8 w-auto"
                    />
                    <h1 className="text-xl font-extrabold text-[#000080] tracking-wide uppercase">
                        ELECTION COMMISSION ADMIN
                    </h1>
                </div>

                {/* Center: Ashoka Chakra */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/60px-Ashoka_Chakra.svg.png"
                        alt="Ashoka Chakra"
                        className="h-12 w-12 animate-spin-slow"
                    />
                </div>

                {/* Right: User Profile */}
                <div className="flex items-center gap-6">
                    <div className="relative cursor-pointer text-gray-600 hover:text-[#FF9933] transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#FF9933] ring-2 ring-white transform translate-x-1/2 -translate-y-1/2"></span>
                    </div>

                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            <User size={20} />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-700">Andatan</span>
                            <ChevronDown size={16} className="text-gray-400" />
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
