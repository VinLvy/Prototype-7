import { NavLink, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { LayoutDashboard, History, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={24} /> },
        { name: 'History', path: '/history', icon: <History size={24} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={24} /> },
    ];

    return (
        <div
            className={`bg-gray-800 text-white h-screen transition-all duration-300 flex flex-col border-r border-gray-700 ${isOpen ? 'w-64' : 'w-20'
                }`}
        >
            {/* Header / Toggle */}
            <div className="p-4 flex items-center justify-between h-16 border-b border-gray-700">
                {isOpen && <h1 className="text-xl font-bold text-purple-400 truncate">ReLife RPG</h1>}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded hover:bg-gray-700 focus:outline-none text-gray-300"
                    title={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                <div className="flex items-center justify-center min-w-[2rem]">
                                    {item.icon}
                                </div>

                                <span
                                    className={`ml-3 whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-lg transition-colors"
                >
                    <div className="flex items-center justify-center min-w-[2rem]">
                        <LogOut size={24} />
                    </div>
                    <span
                        className={`ml-3 whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                            }`}
                    >
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
}
