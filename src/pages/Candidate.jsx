import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const Candidate = () => {
    // Mock Data based on image
    const [candidates] = useState([
        { id: 1001, name: 'Jama Gnaan', party: 'Party', status: 'Approved', photo: 'https://i.pravatar.cc/150?u=1' },
        { id: 1002, name: 'Ehana Shabtan', party: 'Party', status: 'Approved', photo: 'https://i.pravatar.cc/150?u=2' },
        { id: 1003, name: 'Sampa Nam', party: 'Party', status: 'Pending', photo: 'https://i.pravatar.cc/150?u=3' },
        { id: 1004, name: 'Aanei Brlihiyra', party: 'Vañaw Khaklanrm', status: 'Pending', photo: 'https://i.pravatar.cc/150?u=4' },
        { id: 1005, name: 'Marik Hong', party: 'Party', status: 'Pending', photo: 'https://i.pravatar.cc/150?u=5' },
        { id: 1006, name: 'Rodair Bysin', party: 'Party', status: 'Approved', photo: 'https://i.pravatar.cc/150?u=6' },
    ]);

    return (
        <div className="font-sans">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Candidate</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={18} />
                    </div>
                    <button className="bg-[#000080] text-white text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm">
                        <Plus size={18} />
                        Add Candidate
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FF9933] text-white">
                            <th className="py-4 px-6 font-semibold w-24">ID</th>
                            <th className="py-4 px-6 font-semibold w-24">Photo</th>
                            <th className="py-4 px-6 font-semibold">Name</th>
                            <th className="py-4 px-6 font-semibold">Party</th>
                            <th className="py-4 px-6 font-semibold text-center">Status</th>
                            <th className="py-4 px-6 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                        {candidates.map((candidate, index) => (
                            <tr key={candidate.id} className={`border-b border-gray-50 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#E8F5E9]/30'}`}>
                                <td className="py-4 px-6 font-medium">{candidate.id}</td>
                                <td className="py-4 px-6">
                                    <img
                                        src={candidate.photo}
                                        alt={candidate.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                </td>
                                <td className="py-4 px-6 font-medium text-gray-800">{candidate.name}</td>
                                <td className="py-4 px-6">{candidate.party}</td>
                                <td className="py-4 px-6 text-center">
                                    <span
                                        className={`px-4 py-1 rounded-full text-xs font-semibold inline-block w-24
                                        ${candidate.status === 'Approved' ? 'bg-[#138808] text-white' : ''}
                                        ${candidate.status === 'Pending' ? 'bg-[#FFCC80] text-orange-900' : ''}
                                        `}
                                    >
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="bg-[#000080] text-white text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-900 transition-colors">
                                            Edit
                                        </button>
                                        <button className="bg-[#000080] text-white text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-800 transition-colors">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination / Footer info mimicking image style if needed */}
            <div className="p-4 bg-green-50 rounded-b-lg border-t border-green-100 mt-0">
                {/* Placeholder for potential footer content or just clean closure */}
            </div>
        </div>
    );
};

export default Candidate;
