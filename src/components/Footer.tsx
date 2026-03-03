"use client";

import { Mail, Linkedin, Instagram, Code2, ExternalLink, Heart, Github } from "lucide-react";

const SOCIAL_LINKS = [
    { label: "Codeforces", href: "https://codeforces.com/profile/RohitN22595", icon: Code2, color: "hover:border-blue-400 hover:text-blue-500" },
    { label: "LeetCode", href: "https://leetcode.com/u/RohitN22595/", icon: Code2, color: "hover:border-yellow-400 hover:text-yellow-500" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rohitn22595", icon: Linkedin, color: "hover:border-blue-500 hover:text-blue-600" },
    { label: "Instagram", href: "https://instagram.com/ro.hith1499", icon: Instagram, color: "hover:border-pink-400 hover:text-pink-500" },
];

const FEATURES = [
    "Code Store", "Online Compiler", "Contest Calendar",
    "Codeforces Analytics", "LeetCode Analytics", "Notepad", "Todo", "Profile",
];

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-10">
                {/* Three-column layout on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                    {/* Col 1: Brand */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="text-2xl">⚡</span> Coding Dashboard
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            The ultimate competitive programming productivity dashboard. Built for coders, by a coder.
                        </p>
                        <a
                            href="mailto:nrss4244@gmail.com"
                            className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition w-fit"
                        >
                            <Mail size={13} />
                            nrss4244@gmail.com
                        </a>
                    </div>

                    {/* Col 2: Features */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Features</h4>
                        <div className="grid grid-cols-2 gap-1">
                            {FEATURES.map((f) => (
                                <span key={f} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-indigo-400 rounded-full inline-block" />{f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Col 3: Connect */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Connect</h4>
                        <div className="flex flex-col gap-2">
                            {SOCIAL_LINKS.map(({ label, href, icon: Icon, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 
                    text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800
                    transition-all duration-200 group ${color}`}
                                >
                                    <Icon size={13} />
                                    <span>{label}</span>
                                    <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        Made with <Heart size={11} className="text-red-400 fill-red-400" /> by{" "}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rohit Siva Shankar</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        © {new Date().getFullYear()} Coding Dashboard · All rights reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}
