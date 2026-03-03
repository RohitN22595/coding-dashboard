"use client";

import Link from "next/link";
import {
  BookOpen, Code2, CalendarDays, BarChart2, Trophy,
  NotebookPen, CheckSquare, User, ArrowRight, Zap,
} from "lucide-react";

const FEATURES = [
  { icon: BookOpen, label: "Code Store", href: "/code-store", color: "bg-indigo-500", desc: "Track LeetCode, GFG & YouTube problems in a smart table." },
  { icon: Code2, label: "Online Compiler", href: "/compiler", color: "bg-purple-500", desc: "Write and run C++, Java, Python, JS in the browser." },
  { icon: CalendarDays, label: "Contest Calendar", href: "/calendar", color: "bg-sky-500", desc: "See upcoming Codeforces contests on an interactive calendar." },
  { icon: BarChart2, label: "Codeforces Analytics", href: "/codeforces", color: "bg-blue-500", desc: "Deep stats, heatmap, rating graph for any CF handle." },
  { icon: Trophy, label: "LeetCode Analytics", href: "/leetcode", color: "bg-yellow-500", desc: "Solved count, difficulty breakdown, and recent submissions." },
  { icon: NotebookPen, label: "Notepad", href: "/notepad", color: "bg-emerald-500", desc: "Colour-coded sticky notes with instant search." },
  { icon: CheckSquare, label: "Todo Tracker", href: "/todo", color: "bg-rose-500", desc: "Manage daily coding tasks with completion tracking." },
  { icon: User, label: "Your Profile", href: "/profile", color: "bg-orange-500", desc: "Centralise your CP handles, bio, and social links." },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px-180px)]">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-900 dark:via-indigo-950 dark:to-purple-950 text-white py-20 px-6">
        {/* Background grid decoration */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-6 backdrop-blur border border-white/20">
            <Zap size={12} className="text-yellow-300" />
            Still Building – In Progress 🚀
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            The Ultimate<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Competitive Programming
            </span><br />
            Productivity Dashboard
          </h1>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            One platform to track problems, compile code, monitor contests, analyse your CF & LeetCode stats, and manage your competitive programming journey.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/code-store"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition shadow-lg"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              href="/codeforces"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur font-semibold text-sm hover:bg-white/20 transition"
            >
              View Stats <BarChart2 size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About Me ───────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">About Me</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Hi, I&apos;m <span className="font-semibold text-indigo-600 dark:text-indigo-400">Rohit Siva Shankar</span> — a competitive programmer and developer who built this dashboard as a personal productivity tool.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              I compete on Codeforces and LeetCode, and I wanted a single place to track problems, analyse performance, and stay organised — so I built it.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://codeforces.com/profile/RohitN22595" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium hover:opacity-80 transition">
                Codeforces
              </a>
              <a href="https://leetcode.com/u/RohitN22595/" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-medium hover:opacity-80 transition">
                LeetCode
              </a>
              <a href="https://www.linkedin.com/in/rohitn22595" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium hover:opacity-80 transition">
                LinkedIn
              </a>
            </div>
          </div>

          {/* About the site */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">About This Website</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              This is a <span className="font-medium text-indigo-600 dark:text-indigo-400">100% frontend, no-backend</span> productivity dashboard built with Next.js 16 + Tailwind CSS v4.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              All data is stored in your browser&apos;s localStorage. No account needed, no data leaves your device.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {["Next.js 16", "Tailwind v4", "Recharts", "Judge0 API", "Codeforces API"].map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────────────── */}
      <section className="bg-gray-100 dark:bg-gray-900/50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Everything You Need</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">8 powerful tools in one place</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label, href, color, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200"
              >
                <div className={`${color} p-2.5 rounded-xl w-fit`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
                </div>
                <span className="mt-auto text-xs text-indigo-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ready to level up your CP game?
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
          No sign-up needed. Everything runs in your browser. Start tracking now.
        </p>
        <Link
          href="/code-store"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg"
        >
          Start Tracking <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
