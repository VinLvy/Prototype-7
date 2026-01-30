import { NavLink, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { LayoutDashboard, History, Settings, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onUserDataChange, getUserProfile, updateUserProfile, getUserStats, type UserProfile, type UserStats } from '../lib/db';
import { getTitleConfig } from '../lib/titles';
import ProfileModal from './ProfileModal';
import TitlesModal from './TitlesModal';
import ClassesModal from './ClassesModal';
import { getClassConfig } from '../lib/classes';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isTitlesModalOpen, setTitlesModalOpen] = useState(false);
    const [isClassesModalOpen, setClassesModalOpen] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const profile = await getUserProfile(user.id);
                setUserProfile(profile);

                const stats = await getUserStats(user.id);
                setUserStats(stats);
            }
        };
        fetchUser();

        const unsubscribe = onUserDataChange(() => {
            fetchUser();
        });

        return () => {
            unsubscribe();
        };
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

    const handleClassUpdate = async (classId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await updateUserProfile(user.id, { character_class: classId });
            const updated = await getUserProfile(user.id);
            setUserProfile(updated);
            setClassesModalOpen(false);
        }
    };

    const handleTitleUpdate = async (titleId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await updateUserProfile(user.id, { title: titleId });
            const updated = await getUserProfile(user.id);
            setUserProfile(updated);
            setTitlesModalOpen(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // Calculate highest stat for TitlesModal
    // (This helper might not be needed for props anymore but safe to keep if unsure, 
    // though we are removing the prop that used it. Let's keep it if it's used elsewhere? 
    // It's only used in the removed prop. I'll remove it to be clean.)

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={24} /> },
        { name: 'History', path: '/history', icon: <History size={24} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={24} /> },
    ];

    return (
        <div
            className={`h-screen transition-all duration-300 flex flex-col border-r border-white/10 bg-slate-900/40 backdrop-blur-xl ${isOpen ? 'w-55' : 'w-20'
                }`}
        >
            {/* Header / Toggle */}
            <div className="p-4 flex items-center justify-between h-16 border-b border-white/10 shrink-0">
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
            <div className={`flex flex-col items-center py-3 mt-4 border-b border-white/10 transition-all duration-300 ${isOpen ? 'px-4' : 'px-2'}`}>
                <div
                    onClick={() => setProfileModalOpen(true)}
                    className="relative cursor-pointer group shrink-0"
                    title="Edit Profile"
                >
                    {(() => {
                        const titleConfig = getTitleConfig(userProfile?.title);
                        return (
                            <div className={`${isOpen ? 'w-20 h-20' : 'w-10 h-10'} rounded-full overflow-hidden bg-gray-700 border-3 ${titleConfig.borderColor} transition-all duration-300 shadow-lg shadow-purple-900/20`}>
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <UserIcon size={isOpen ? 36 : 20} />
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Hover Edit Overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                        <Edit2 size={isOpen ? 24 : 14} className="text-white drop-shadow-md" />
                    </div>
                </div>

                <div className={`mt-3 text-center overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0'}`}>
                    <h3 className="font-bold text-white truncate max-w-[12rem] mx-auto text-lg leading-tight">
                        {userProfile?.username || 'Adventurer'}
                    </h3>
                    {(() => {
                        const titleConfig = getTitleConfig(userProfile?.title);
                        return (
                            <div
                                onClick={() => setTitlesModalOpen(true)}
                                className="group relative inline-block mt-1 cursor-pointer"
                                title="Change Title"
                            >
                                <p className={`text-xs truncate max-w-[12rem] mx-auto font-medium px-2 py-0.5 rounded-md border bg-gradient-to-r ${titleConfig.textColor} ${titleConfig.borderColor} ${titleConfig.bgGradient} group-hover:brightness-110 transition-all`}>
                                    {(userProfile?.title || titleConfig.name).toUpperCase()}
                                </p>
                                <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit2 size={12} className="text-gray-400" />
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Class Badge */}
                <div className={`mt-2 mb-1 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {(() => {
                        const classConfig = getClassConfig(userProfile?.character_class);
                        const ClassIcon = classConfig.icon;
                        return (
                            <button
                                onClick={() => setClassesModalOpen(true)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-900/50 hover:bg-gray-800 transition-all group ${classConfig.borderColor}`}
                                title="Change Class"
                            >
                                <div className={`p-1 rounded bg-gray-800 ${classConfig.color}`}>
                                    <ClassIcon size={14} />
                                </div>
                                <span className={`text-xs font-bold ${classConfig.color}`}>
                                    {classConfig.name}
                                </span>
                            </button>
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
            <div className="p-4 border-t border-white/10">
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

            <TitlesModal
                isOpen={isTitlesModalOpen}
                onClose={() => setTitlesModalOpen(false)}
                userStats={userStats}
                currentTitleId={userProfile?.title}
                onSelectTitle={handleTitleUpdate}
            />

            <ClassesModal
                isOpen={isClassesModalOpen}
                onClose={() => setClassesModalOpen(false)}
                userStats={userStats}
                currentClassId={userProfile?.character_class}
                onSelectClass={handleClassUpdate}
            />
        </div >
    );
}
