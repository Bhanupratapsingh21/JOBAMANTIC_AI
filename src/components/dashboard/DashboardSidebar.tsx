"use client";

import {
    LayoutDashboard,
    FileText,
    Star,
    User,
    Settings,
    LogOut,
    X,
    Plus,
    BarChart3,
    ListChecks
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";


interface DashboardSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }: DashboardSidebarProps) {
    const { user } = useUserStore();
    const router = useRouter();
    const logout = useUserStore((state) => state.logout);
    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-purple-500 to-pink-500", path: "/dashboard" },
        { id: "resumes", label: "My Resumes", icon: FileText, color: "from-blue-500 to-cyan-500", path: "/dashboard/resumes" },
        { id: "create", label: "Create New", icon: Plus, color: "from-green-500 to-teal-500", path: "/resume/create" },
        { id: "templates", label: "Templates", icon: Star, color: "from-orange-500 to-red-500", path: "/dashboard/templates" },
        { id: "autofill", label: "Autofill Select", icon: ListChecks, color: "from-amber-500 to-orange-500", path: "/dashboard/autofill" },
        { id: "analyze", label: "Smart Analyzer", icon: BarChart3, color: "from-indigo-500 to-purple-500", path: "/dashboard/upload" },
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
        setSidebarOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await logout(); // call the Zustand logout fn
            router.push("/"); // redirect to login or landing page
        } catch (error) {
            console.error("❌ Error signing out:", error);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:relative z-50 w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}


                    {/* User Info */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {user?.name || "User"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6 overflow-y-auto">
                        <ul className="space-y-3">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleNavigation(item.path)}
                                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {item.label}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}