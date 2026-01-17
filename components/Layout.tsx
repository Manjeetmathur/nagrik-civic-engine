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
    Mail
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
        { id: 'map' as View, label: 'Voice Map', icon: MapPin },
        { id: 'citizen-map' as View, label: 'Citizen Map', icon: MapPin },
        { id: 'voice-reports' as View, label: 'Voice Reports', icon: ShieldAlert },
        { id: 'voice-analytics' as View, label: 'Voice Analytics', icon: BarChart3 },
        { id: 'citizen-reports' as View, label: 'Citizen Reports', icon: Users },
        { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
        { id: 'cameras' as View, label: 'Cameras', icon: Video },
        { id: 'feedback-reports' as View, label: 'Feedback Reports', icon: MessageSquare },
        { id: 'authority-contact' as View, label: 'Authority Contact', icon: Mail },
    ];

    return (
        <div className="h-screen bg-[#fafafa] flex overflow-hidden">
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
        w-64 bg-white border-r border-zinc-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex ">
                            <div className="mt-1">
                                <img
                                    src="/logo.png"
                                    alt="Nagrik Logo"
                                    className="object-cover h-16"
                                />
                            </div>

                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600"
                        >
                            <X size={20} />
                        </button>
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
                                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-none
                    text-sm font-medium transition-all
                    ${isActive
                                            ? 'bg-zinc-900 text-white shadow-sm'
                                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                        }
                  `}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-none text-sm font-medium hover:bg-zinc-200 transition-colors"
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
                <main className="flex-1 p-4 sm:p-8  overflow-auto">
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
