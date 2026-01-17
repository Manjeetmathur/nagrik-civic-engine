'use client';

import React from 'react';
import { View, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { PageTransition } from './PageTransition';
import {
    LayoutDashboard,
    ShieldAlert,
    Users,
    BarChart3,
    Video,
    LogOut,
    Menu,
    X,
    MapPin,
    MessageSquare,
    Wind,
    Mail,
    Bell
} from 'lucide-react';

interface LayoutProps {
    currentView: View;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    user: User;
    isBackendLive: boolean;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
    currentView,
    onNavigate,
    onLogout,
    user,
    isBackendLive,
    children
}) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navItems = [
        { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'alerts' as View, label: 'All Alerts', icon: Bell },
         { id: 'cameras' as View, label: 'Cameras', icon: Video },
        { id: 'air-quality' as View, label: 'Air Quality', icon: Wind },
        { id: 'citizen-reports' as View, label: 'Citizen Reports', icon: Users },

        { id: 'citizen-map' as View, label: 'Citizen Map', icon: MapPin },
        { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
        { id: 'feedback-reports' as View, label: 'Feedback Reports', icon: MessageSquare },
        { id: 'authority-contact' as View, label: 'Authority Contact', icon: Mail },
        { id: 'voice-reports' as View, label: 'Voice Reports', icon: ShieldAlert },
        { id: 'voice-analytics' as View, label: 'Voice Analytics', icon: BarChart3 },
        { id: 'map' as View, label: 'Voice Map', icon: MapPin },
       
    ];

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex overflow-hidden">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-200 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <div className="mt-1">
                                <img
                                    src="/logo.png"
                                    alt="Nagrik Logo"
                                    className="h-10 w-auto"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nagrik</h1>
                                <p className="text-xs text-slate-500 font-medium">Civic Engine</p>
                            </div>
                        </div>
                    </div>
                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: index * 0.05,
                                        duration: 0.3,
                                        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
                                    }}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentView === item.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">{user.name.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border-2 border-slate-200 rounded-lg text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">


                {/* Page content */}
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <PageTransition key={currentView}>
                            {children}
                        </PageTransition>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;
