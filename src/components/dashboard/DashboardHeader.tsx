"use client";

import { Menu } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeTab?: string;
}

export default function DashboardHeader({
    sidebarOpen,
    setSidebarOpen,
    activeTab = "dashboard"
}: DashboardHeaderProps) {
    const navigationItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "resumes", label: "My Resumes" },
        { id: "create", label: "Create New" },
        { id: "templates", label: "Templates" },
        { id: "autofill", label: "Autofill Select" },
        { id: "analyze", label: "Smart Analyzer." },
        { id: "profile", label: "Profile" },
        { id: "settings", label: "Settings" },
    ];

    const currentLabel = navigationItems.find(item => item.id === activeTab)?.label || "Dashboard";

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <motion.h1
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
                    >
                        {currentLabel}
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4"
                >
                    <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Today is</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {format(new Date(), "EEEE, MMMM dd")}
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.header>
    );
}