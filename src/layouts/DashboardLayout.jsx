import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = () => {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 pt-24">
                <Sidebar />
                <main className="flex-1 ml-64 p-6 overflow-y-auto">
                    <Outlet />
                    <footer className="mt-8 py-6 bg-[#138808] relative text-white">
                        {/* Tricolor Top Border */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

                        <div className="flex flex-col items-center justify-center px-4 text-center">
                            <p className="text-sm font-medium text-white">
                                &copy; {new Date().getFullYear()} Election Commission of India. All rights reserved.
                            </p>
                            <div className="flex gap-6 mt-3 text-xs font-medium text-white">
                                <a href="#" className="!text-white hover:!text-[#FF9933] transition-colors uppercase tracking-wide decoration-0">Privacy Policy</a>
                                <span className="text-white">|</span>
                                <a href="#" className="!text-white hover:!text-[#FF9933] transition-colors uppercase tracking-wide decoration-0">Terms of Use</a>
                                <span className="text-white">|</span>
                                <a href="#" className="!text-white hover:!text-[#FF9933] transition-colors uppercase tracking-wide decoration-0">Accessibility</a>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
