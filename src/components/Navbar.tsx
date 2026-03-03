"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Code2, CalendarDays, BarChart2, Home, Sun, Moon, Menu, X,
    Layers, NotebookPen, Trophy, CheckSquare, User, BookOpen, Grid3X3,
} from "lucide-react";
import { toggleTheme, getStoredTheme, applyStoredTheme } from "@/lib/theme";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/code-store", label: "Code Store", icon: BookOpen },
    { href: "/compiler", label: "Compiler", icon: Code2 },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/codeforces", label: "Codeforces", icon: BarChart2 },
    { href: "/leetcode", label: "LeetCode", icon: Trophy },
    { href: "/notepad", label: "Notepad", icon: NotebookPen },
    { href: "/todo", label: "Todo", icon: CheckSquare },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/games/sudoku", label: "Sudoku", icon: Grid3X3 },
] as const;

export default function Navbar() {
    const pathname = usePathname();
    const [darkMode, setDarkMode] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => { applyStoredTheme(); setDarkMode(getStoredTheme()); }, []);
    const handleThemeToggle = () => setDarkMode((prev) => toggleTheme(prev));
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400 tracking-tight shrink-0">
                        <Layers size={20} />
                        <span className="hidden sm:inline">Coding Dashboard</span>
                    </Link>

                    {/* Desktop nav — scrollable on medium screens */}
                    <div className="hidden md:flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive(href)
                                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                    }`}
                            >
                                <Icon size={13} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleThemeToggle}
                            title={darkMode ? "Light mode" : "Dark mode"}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            {darkMode ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-indigo-600" />}
                        </button>
                        <button
                            onClick={() => setMobileOpen((o) => !o)}
                            className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 grid grid-cols-3 gap-1">
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${isActive(href)
                                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                        >
                            <Icon size={13} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
