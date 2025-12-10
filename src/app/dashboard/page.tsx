"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <DashboardContent />
        </motion.div>
    );
}