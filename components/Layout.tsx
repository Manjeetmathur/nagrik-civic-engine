'use client';

import React from 'react';
import { View, User } from '@/types';
import {
    LayoutDashboard,
    ShieldAlert,
    Users,
    BarChart3,
    Video,
    LogOut,
    Menu,
    X
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
        { id: 'alerts' as View, label: 'All Alerts', icon: ShieldAlert },
        { id: 'citizen-reports' as View, label: 'Citizen Reports', icon: Users },
        { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
        { id: 'cameras' as View, label: 'Cameras', icon: Video },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

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
                        <div className="flex items-center gap-2.5">
                            <div className="bg-zinc-900 p-1.5 rounded-md text-white">
                                <ShieldAlert size={20} />
                            </div>
                            <h1 className="font-bold text-zinc-900 tracking-tight">
                                Nagar <span className="text-indigo-600">Admin</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    text-sm font-medium transition-all
                    ${isActive
                                            ? 'bg-zinc-900 text-white shadow-sm'
                                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                        }
                  `}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </button>
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
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
                    <div className="px-4 sm:px-8 h-16 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex-1" />

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isBackendLive
                                ? 'bg-indigo-50 border-indigo-100'
                                : 'bg-zinc-100 border-zinc-200'
                            }`}>
                            <span className={`h-2 w-2 rounded-full ${isBackendLive ? 'bg-indigo-600 animate-pulse' : 'bg-zinc-400'
                                }`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isBackendLive ? 'text-indigo-700' : 'text-zinc-500'
                                }`}>
                                {isBackendLive ? 'Live System' : 'Offline Mode'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
