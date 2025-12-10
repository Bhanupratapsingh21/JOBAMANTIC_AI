"use client";
import { Grid3X3, Home } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <>
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-6">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">Resume Builder</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              
                     <Link href={"/dashboard"}>      <Home className="w-4 h-4" /></Link>
                    <Link href={"/dashboard"}>/</Link>
                    <span className="bg-muted px-2 py-1 rounded">My Resume</span>
                </div>
                <div className="flex items-center space-x-4">
                    <Grid3X3 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">Templates</span>
                </div>
            </div>
        </>
    )
}