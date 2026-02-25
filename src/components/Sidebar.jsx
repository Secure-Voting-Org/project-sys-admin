import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Settings, LogOut, CheckCircle, FileText, Vote, LayoutDashboard, BarChart3 } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-24 bottom-0 z-40 overflow-y-auto font-sans">
            <nav className="flex-1 p-4 space-y-2 mt-4">

                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="System Overview" activeColor="border-l-4 border-[#FF9933] bg-orange-50 text-[#FF9933]" />

                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mt-6 mb-2 px-4">Access Control</div>
                <NavItem to="/users" icon={<Users size={20} />} label="User Integrity" />
                <NavItem to="/admins" icon={<Users size={20} />} label="Admin Management" />

                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mt-6 mb-2 px-4">Monitoring</div>
                <NavItem to="/health" icon={<CheckCircle size={20} />} label="System Health" />
                <NavItem to="/audit-logs" icon={<FileText size={20} />} label="Audit Logs" />
                <NavItem to="/performance" icon={<BarChart3 size={20} />} label="Performance" />

                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mt-6 mb-2 px-4">Configuration</div>
                <NavItem to="/settings" icon={<Settings size={20} />} label="Global Settings" />
            </nav>
        </aside>
    );
};

const NavItem = ({ to, icon, label, hasDropdown, activeColor }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 rounded-r-lg transition-all duration-200 mb-1 group ${isActive
                ? activeColor || 'bg-orange-50 text-[#FF9933] font-bold'
                : 'text-gray-800 hover:bg-gray-50 hover:text-gray-800'
            }`
        }
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        {hasDropdown && (
            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        )}
    </NavLink>
);

export default Sidebar;
