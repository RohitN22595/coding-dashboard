import Link from "next/link";
import { Code2, Globe, Zap, BarChart2, Trophy, BookOpen, Cpu, Download, ExternalLink } from "lucide-react";

const EXPERIENCE = [
    {
        role: "Web Developer",
        org: "Alcheringa, IIT Guwahati",
        period: "2024 – Present",
        url: null,
        points: [
            "Built the official registration platform at registrations.alcheringa.co.in — real users, real scale",
            "Contributed to performance and feature development of the alcheringa.co.in main website",
            "Engineered robust form flows, authentication, and optimized page performance under load",
        ],
        accent: "bg-indigo-500",
        links: [
            { href: "https://registrations.alcheringa.co.in/", label: "registrations.alcheringa.co.in" },
            { href: "https://alcheringa.co.in/", label: "alcheringa.co.in" },
        ],
    },
    {
        role: "Builder — CodeHub",
        org: "Independent Developer",
        period: "2024 – Present",
        url: null,
        points: [
            "Built CodeHub — a full-stack CP dashboard with Codeforces analytics, LeetCode stats, contest calendar, and online compiler",
            "Developed four browser games (Chess with minimax AI, Sudoku, 2048, Tic Tac Toe) with a shared coin system",
            "Focus on clean architecture, production code quality, and developer experience",
        ],
        accent: "bg-purple-500",
        links: [],
    },
];

const SKILLS = [
    { label: "Next.js", icon: Globe },
    { label: "React", icon: Code2 },
    { label: "TypeScript", icon: Code2 },
    { label: "Tailwind CSS", icon: Cpu },
    { label: "Node.js", icon: Globe },
    { label: "REST APIs", icon: Zap },
    { label: "Codeforces", icon: BarChart2 },
    { label: "LeetCode", icon: Trophy },
    { label: "DSA", icon: BookOpen },
    { label: "Minimax / AI", icon: Cpu },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* Header */}
            <section className="relative overflow-hidden py-24 px-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20" />
                <div className="absolute inset-0 opacity-30 dark:opacity-10"
                    style={{ backgroundImage: "radial-gradient(#c7d2fe 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
                        <Code2 size={12} /> CodeHub · MnC · IIT Guwahati · Batch of 2028
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                        About CodeHub &amp; The Developer Behind It
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8">
                        I am a 2nd Year Mathematics and Computing student at IIT Guwahati, passionate about competitive programming, scalable systems, and building developer tools.
                    </p>
                    {/* Resume download — prominent */}
                    <a href="/resume.pdf" download
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 hover:scale-[1.02]">
                        <Download size={15} /> Download Resume
                    </a>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-6 pb-24 flex flex-col gap-16">

                {/* Introduction */}
                <section>
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Introduction</h2>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                            Hi, I&apos;m <span className="font-bold text-gray-900 dark:text-white">Rohit Siva Shankar</span> — a developer who loves turning complex ideas into clean, working systems.
                            Whether it&apos;s a production registration portal for 10,000+ festival attendees or an unbeatable chess AI running in your browser, I bring precision and care to every line of code.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base mt-4">
                            My background spans full-stack web development and competitive programming — two disciplines that complement each other beautifully: one teaches you to ship, the other teaches you to think.
                        </p>
                    </div>
                </section>

                {/* Experience timeline */}
                <section>
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6">Experience &amp; Impact</h2>
                    <div className="relative flex flex-col gap-8">
                        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-300 dark:from-indigo-700 via-purple-300 dark:via-purple-700 to-transparent" />
                        {EXPERIENCE.map(({ role, org, period, points, accent, links }) => (
                            <div key={role} className="relative flex gap-5">
                                <div className={`mt-1 w-5 h-5 rounded-full ${accent} shadow-md flex-shrink-0 flex items-center justify-center z-10`}>
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{role}</h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{org}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono shrink-0">{period}</span>
                                    </div>
                                    <ul className="flex flex-col gap-1.5 mb-3">
                                        {points.map(p => (
                                            <li key={p} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                <span className="text-indigo-400 mt-0.5 flex-shrink-0">›</span> {p}
                                            </li>
                                        ))}
                                    </ul>
                                    {links.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {links.map(({ href, label }) => (
                                                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                                    <ExternalLink size={10} /> {label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CP focus */}
                <section>
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Competitive Programming Focus</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { icon: "🔥", title: "Daily Practice", desc: "Consistent daily problem solving on Codeforces and LeetCode — building algorithmic intuition over time." },
                            { icon: "📈", title: "Rating Growth", desc: "Focused on progressive rating improvement with deep contest analysis and weakness identification." },
                            { icon: "🧠", title: "Algorithm Depth", desc: "Strong understanding of DP, Graphs, Trees, Segment Trees, and Number Theory." },
                            { icon: "⚡", title: "Optimization Mindset", desc: "Always looking for cleaner, faster solutions — time and space complexity at the core of every approach." },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex gap-3">
                                <span className="text-xl mt-0.5">{icon}</span>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technical skills */}
                <section>
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Technical Strengths</h2>
                    <div className="flex flex-wrap gap-2">
                        {SKILLS.map(({ label, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                                <Icon size={12} className="text-indigo-500 dark:text-indigo-400" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vision */}
                <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">The Vision</h2>
                    <blockquote className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic border-l-2 border-indigo-400 pl-4">
                        &ldquo;CodeHub is built to simplify and enhance the competitive programming journey — one tool that tracks your progress, sharpens your skills, and makes the grind a little more enjoyable.&rdquo;
                    </blockquote>
                </section>

                {/* Resume + Links */}
                <section>
                    <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Connect &amp; Download</h2>
                    <div className="flex flex-wrap gap-3">
                        <a href="/resume.pdf" download
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                            <Download size={14} /> Download Resume
                        </a>
                        {[
                            { label: "LinkedIn", href: "https://www.linkedin.com/in/rohitn22595", color: "text-blue-600 dark:text-blue-400   bg-blue-50 dark:bg-blue-900/20   border-blue-200 dark:border-blue-800" },
                            { label: "GitHub", href: "https://github.com/RohitN22595", color: "text-gray-700 dark:text-gray-300   bg-gray-100 dark:bg-gray-800     border-gray-200 dark:border-gray-700" },
                            { label: "Codeforces", href: "https://codeforces.com/profile/RohitN22595", color: "text-blue-600 dark:text-blue-400   bg-blue-50 dark:bg-blue-900/20   border-blue-200 dark:border-blue-800" },
                            { label: "LeetCode", href: "https://leetcode.com/u/RohitN22595/", color: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" },
                        ].map(({ label, href, color }) => (
                            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-md ${color}`}>
                                <ExternalLink size={12} /> {label}
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
