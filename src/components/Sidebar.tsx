import { NavLink, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { LayoutDashboard, History, Settings, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, type UserProfile } from '../lib/db';
import { getTitleConfig } from '../lib/titles';
import ProfileModal from './ProfileModal';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const profile = await getUserProfile(user.id);
                setUserProfile(profile);
            }
        };
        fetchUser();
    }, []);

    const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await updateUserProfile(user.id, updates);
            // Refresh local state
            const updated = await getUserProfile(user.id);
            setUserProfile(updated);
        }
    };

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
            className={`bg-gray-800 text-white h-screen transition-all duration-300 flex flex-col border-r border-gray-700 ${isOpen ? 'w-55' : 'w-20'
                }`}
        >
            {/* Header / Toggle */}
            <div className="p-4 flex items-center justify-between h-16 border-b border-gray-700 shrink-0">
                {isOpen && <h1 className="text-xl font-bold text-purple-400 truncate">ReLife RPG</h1>}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded hover:bg-gray-700 focus:outline-none text-gray-300"
                    title={isOpen ? "Collapse" : "Expand"}
                >
                    {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
            </div>

            {/* Profile Section */}
            <div className={`flex flex-col items-center py-6 border-b border-gray-700 transition-all duration-300 ${isOpen ? 'px-4' : 'px-2'}`}>
                <div
                    onClick={() => setProfileModalOpen(true)}
                    className="relative cursor-pointer group shrink-0"
                    title="Edit Profile"
                >
                    <div className={`${isOpen ? 'w-20 h-20' : 'w-10 h-10'} rounded-full overflow-hidden bg-gray-700 border-2 border-purple-500 transition-all duration-300 shadow-lg shadow-purple-900/20`}>
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <UserIcon size={isOpen ? 36 : 20} />
                            </div>
                        )}
                    </div>

                    {/* Hover Edit Overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                        <Edit2 size={isOpen ? 24 : 14} className="text-white drop-shadow-md" />
                    </div>
                </div>

                <div className={`mt-3 text-center overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                    <h3 className="font-bold text-white truncate max-w-[12rem] mx-auto text-lg leading-tight">
                        {userProfile?.username || 'Adventurer'}
                    </h3>
                    {(() => {
                        const titleConfig = getTitleConfig(userProfile?.title);
                        return (
                            <p className={`text-xs truncate max-w-[12rem] mx-auto mt-1 font-medium px-2 py-0.5 rounded-md inline-block border bg-gradient-to-r ${titleConfig.textColor} ${titleConfig.borderColor} ${titleConfig.bgGradient}`}>
                                {userProfile?.title || titleConfig.name}
                            </p>
                        );
                    })()}
                </div>
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

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                userProfile={userProfile}
                onUpdate={handleProfileUpdate}
            />
        </div >
    );
}
