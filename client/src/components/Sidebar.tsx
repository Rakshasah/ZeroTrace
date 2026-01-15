import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
    onSelectUser: (user: any) => void;
    selectedUser: any;
    currentUser: any;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectUser, selectedUser, currentUser }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        fetch('http://localhost:3000/auth/users')
            .then(res => res.json())
            .then(data => {
                setUsers(Array.isArray(data) ? data.filter((u: any) => u.id !== currentUser.id) : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch users error:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000); // Live update
        return () => clearInterval(interval);
    }, [currentUser]);

    return (
        <div className="w-80 h-full bg-[#111827] border-r border-white/5 flex flex-col">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Contacts</h2>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search identities..."
                        className="w-full h-10 bg-black/20 border border-white/5 rounded-xl px-4 text-sm outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : users.length > 0 ? (
                    users.map((user) => (
                        <motion.button
                            key={user.id}
                            whileHover={{ x: 4 }}
                            onClick={() => onSelectUser(user)}
                            className={`w-full p-4 mb-2 rounded-2xl text-left transition-all flex items-center space-x-4 border ${selectedUser?.id === user.id
                                ? 'bg-blue-600/10 border-blue-500/30'
                                : 'hover:bg-white/5 border-transparent'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 text-blue-400 font-bold">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className={`text-sm font-semibold truncate ${selectedUser?.id === user.id ? 'text-blue-400' : 'text-gray-200'}`}>
                                    {user.username}
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono truncate">{user.id.slice(0, 8)}...</p>
                            </div>
                        </motion.button>
                    ))
                ) : (
                    <div className="text-center mt-10">
                        <p className="text-gray-500 text-sm">No other users found.</p>
                        <p className="text-[10px] text-gray-600 mt-2 mt-2">The network is currently private.</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-black/10 border-t border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {currentUser.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                        <p className="text-[9px] text-green-500 font-bold tracking-widest uppercase">Identity Secure</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
