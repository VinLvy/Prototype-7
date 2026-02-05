import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ModernBackground from './ModernBackground';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-transparent overflow-hidden relative">
            <div className="absolute inset-0 z-[-1]">
                <ModernBackground />
            </div>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 overflow-auto relative transition-all duration-300">
                <Outlet />
            </div>
        </div>
    );
}
