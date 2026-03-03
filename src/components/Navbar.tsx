"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sun, Moon, Menu, X, Github, Linkedin, Download,
    ChevronDown, Code2,
} from "lucide-react";
import { toggleTheme, getStoredTheme, applyStoredTheme } from "@/lib/theme";

const PRIMARY_LINKS = [
    { href: "/", label: "Home" },
    { href: "/codeforces", label: "CP" },
    { href: "/compiler", label: "Compiler" },
    { href: "/games", label: "Games" },
    { href: "/code-store", label: "Code Store" },
    { href: "/notepad", label: "Notes" },
    { href: "/todo", label: "Todo" },
    { href: "/calendar", label: "Calendar" },
    { href: "/about", label: "About" },
] as const;

const MOBILE_EXTRA = [
    { href: "/leetcode", label: "LeetCode" },
    { href: "/profile", label: "Profile" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [dark, setDark] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => { applyStoredTheme(); setDark(getStoredTheme()); }, []);
    useEffect(() => { setMobileOpen(false); setToolsOpen(false); }, [pathname]);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const handleTheme = () => setDark(prev => toggleTheme(prev));
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/85 dark:bg-gray-950/85 backdrop-blur-xl border-b border-gray-200/70 dark:border-white/8 shadow-lg shadow-black/5"
                : "bg-white/65 dark:bg-gray-950/65 backdrop-blur-lg border-b border-gray-200/40 dark:border-white/5"
            }`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>

                    {/* ── Logo ── */}
                    <Link href="/" className="shrink-0 flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-200">
                            <Code2 size={16} className="text-white" />
                        </div>
                        <span className="font-black text-base tracking-tight text-gray-900 dark:text-white hidden sm:inline">
                            Code<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                        </span>
                    </Link>

                    {/* ── Desktop nav ── */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {PRIMARY_LINKS.map(({ href, label }) => (
                            <Link key={href} href={href}
                                className={`relative px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${isActive(href)
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5"
                                    }`}>
                                {label}
                                {isActive(href) && (
                                    <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                                )}
                            </Link>
                        ))}
                        {/* More dropdown */}
                        <div className="relative">
                            <button onClick={() => setToolsOpen(o => !o)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/5 transition-all duration-200">
                                More <ChevronDown size={12} className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
                            </button>
                            {toolsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-xl shadow-black/10 py-1.5 z-50">
                                        {MOBILE_EXTRA.map(({ href, label }) => (
                                            <Link key={href} href={href}
                                                className="flex px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                {label}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Right actions ── */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <a href="https://github.com/RohitN22595" target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200 hidden sm:flex">
                            <Github size={17} />
                        </a>
                        <a href="https://www.linkedin.com/in/rohitn22595" target="_blank" rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hidden sm:flex">
                            <Linkedin size={17} />
                        </a>
                        <a href="/resume.pdf" download
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-500/20">
                            <Download size={12} /> Resume
                        </a>
                        <button onClick={handleTheme}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200">
                            {dark
                                ? <Sun size={17} className="text-yellow-400" />
                                : <Moon size={17} className="text-indigo-500" />}
                        </button>
                        <button onClick={() => setMobileOpen(o => !o)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200">
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile drawer ── */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                }`}>
                <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-white/8 px-4 py-3 flex flex-col gap-0.5">
                    {[...PRIMARY_LINKS, ...MOBILE_EXTRA].map(({ href, label }) => (
                        <Link key={href} href={href}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(href)
                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                }`}>
                            {label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-2 pt-3 mt-1 border-t border-gray-200/60 dark:border-white/8">
                        <a href="https://github.com/RohitN22595" target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <Github size={14} /> GitHub
                        </a>
                        <a href="https://www.linkedin.com/in/rohitn22595" target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            <Linkedin size={14} /> LinkedIn
                        </a>
                        <a href="/resume.pdf" download
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm bg-indigo-600 text-white font-semibold">
                            <Download size={14} /> Resume
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
