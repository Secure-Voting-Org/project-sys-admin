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
                    <footer className="mt-8 py-4 bg-green-700 text-white text-center text-xs rounded-t-lg">
                        Footer you made is reserved privacy policy
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
