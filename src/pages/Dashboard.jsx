import React from 'react';
import { Users, Vote, AlertTriangle, Radio, TrendingUp, Building2, UserCheck, ArrowUp } from 'lucide-react';
import LifecycleController from '../components/LifecycleController';

const Dashboard = () => {
    return (
        <div className="space-y-6 font-sans">

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>

            <LifecycleController />

            {/* Row 1: Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Voters"
                    value="95 Crores"
                    trend="Trend = 95 Crores"
                    icon={<Users className="text-white" size={20} />}
                    color="bg-[#138808]" // Green
                    trendValue={true}
                />
                <StatsCard
                    title="Polling Stations"
                    value="1.2 Lakhs"
                    trend="Trend = 1,200"
                    icon={<Building2 className="text-white" size={20} />}
                    color="bg-[#000080]" // Blue
                />
                <StatsCard
                    title="Candidates"
                    value="8,500"
                    trend="Trend - 6,500"
                    icon={<AlertTriangle className="text-white" size={20} />}
                    color="bg-[#FF9933]" // Orange
                />
                <StatsCard
                    title="Election Status"
                    value="Live"
                    subtext="Blinking Status Live"
                    icon={<Radio className="text-white animate-pulse" size={20} />}
                    color="bg-[#138808]" // Green
                    isStatus={true}
                />
            </div>

            {/* Row 2: Left Stats Column & Right Chart */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column Vertical Stats */}
                <div className="w-full lg:w-1/4 space-y-4">
                    {/* Stat Item 1 */}
                    <SideStatCard
                        title="Polling Stations"
                        value="1.2K Lakhs"
                        trend="Trend = 1.2 Lakhs"
                        icon={<Building2 className="text-white" size={18} />}
                        color="bg-[#000080]"
                    />

                    {/* Stat Item 2 */}
                    <SideStatCard
                        title="Candidates"
                        value="8,500"
                        trend="Trend > 8,500"
                        icon={<AlertTriangle className="text-white" size={18} />}
                        color="bg-[#FF9933]"
                    />

                    {/* Stat Item 3 */}
                    <SideStatCard
                        title="Polling Stations"
                        value="1.2 Lakhs"
                        trend="Trend > 1.2 Lakhs"
                        icon={<Building2 className="text-white" size={18} />}
                        color="bg-[#138808]"
                    />
                </div>

                {/* Right Column Chart */}
                <div className="w-full lg:w-3/4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 text-lg">Voter Turnout by State</h3>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-6 px-4">
                        {/* Scale */}
                        <div className="flex flex-col justify-between h-full text-xs text-gray-400 pb-6">
                            <span>70 0th</span>
                            <span>60 0th</span>
                            <span>50 0th</span>
                            <span>40 0th</span>
                            <span>30 0th</span>
                            <span>20 0th</span>
                            <span>10 0th</span>
                            <span>0</span>
                        </div>

                        {/* Bars */}
                        <div className="flex-1 flex items-end justify-between h-full pb-6 border-b border-gray-100">
                            {/* Data: [Label, Height%, ColorClass] */}
                            {[
                                ['Jan', 45, 'bg-[#FF9933]'],
                                ['Feb', 60, 'bg-[#138808]'],
                                ['Mar', 30, 'bg-[#FF9933]'],
                                ['Apr', 45, 'bg-[#138808]'],
                                ['May', 65, 'bg-[#FF9933]'],
                                ['Jun', 40, 'bg-[#138808]'],
                                ['Jul', 55, 'bg-[#FF9933]'],
                                ['Aug', 35, 'bg-[#138808]'],
                                ['Sep', 50, 'bg-[#138808]']
                            ].map(([label, height, color], i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full h-full justify-end">
                                    <div
                                        className={`w-4 sm:w-8 rounded-t-sm transition-all duration-500 ${color} hover:opacity-80`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-500">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, trend, icon, color, isStatus, subtext, trendValue }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden">
        <div className="flex justify-between items-start">
            {/* Icon Box */}
            <div className={`${color} p-2 rounded-lg shadow-md`}>
                {icon}
            </div>

            <div className="text-right">
                <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
                <div className="flex items-center justify-end gap-1 mt-1">
                    <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
                    {trendValue && <ArrowUp size={16} className="text-[#138808]" />}
                </div>
            </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50">
            {isStatus ? (
                <div className="flex items-center justify-between text-xs font-semibold text-[#138808] bg-green-50 px-2 py-1 rounded">
                    {subtext}
                    <span className="w-2 h-2 bg-[#138808] rounded-full animate-pulse"></span>
                </div>
            ) : (
                <p className="text-xs text-gray-400 font-medium">
                    {trend}
                </p>
            )}
        </div>
    </div>
);

const SideStatCard = ({ title, value, trend, icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className={`${color} p-2 rounded-lg shadow-md mr-4`}>
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="text-gray-500 text-xs font-medium">{title}</h4>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            <p className="text-[10px] text-gray-400 mt-1 pb-1 border-b border-gray-50 w-full">{trend}</p>
        </div>
    </div>
);

export default Dashboard;
