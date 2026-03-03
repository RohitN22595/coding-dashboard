"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart2, CalendarDays, NotebookPen,
  CheckSquare, BookOpen, Code2, Play, Gamepad2, ExternalLink,
  Zap, Target, Flame,
} from "lucide-react";

// ─── Feature cards ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart2, emoji: "📊",
    title: "CP Stats Tracker",
    desc: "Check your or a friend's Codeforces stats — rating, rank, problems solved, and a full performance graph.",
    href: "/codeforces",
    cta: "View Stats",
    accent: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: CalendarDays, emoji: "📅",
    title: "Contest Calendar",
    desc: "Never miss an upcoming Codeforces contest. Visual calendar with dates, durations, and quick links.",
    href: "/calendar",
    cta: "View Calendar",
    accent: "from-sky-500 to-cyan-600",
    bg: "bg-sky-50 dark:bg-sky-900/20",
    text: "text-sky-600 dark:text-sky-400",
  },
  {
    icon: NotebookPen, emoji: "📝",
    title: "Notes Manager",
    desc: "Store problem insights, editorial notes, and code patterns in colour-coded sticky notes with instant search.",
    href: "/notepad",
    cta: "Go to Notes",
    accent: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: CheckSquare, emoji: "✅",
    title: "Todo Manager",
    desc: "Add daily problem-solving goals, track completion, and maintain your coding consistency.",
    href: "/todo",
    cta: "Open Todo",
    accent: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: BookOpen, emoji: "🗄️",
    title: "Code Store",
    desc: "Store and manage reusable code snippets, categorise by topic, and search across your entire library.",
    href: "/code-store",
    cta: "Open Code Store",
    accent: "from-orange-500 to-amber-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Code2, emoji: "⚡",
    title: "Online Compiler",
    desc: "Write and run C++, Java, Python, or JavaScript instantly in a VS Code-style editor with stdin/stdout support.",
    href: "/compiler",
    cta: "Open Compiler",
    accent: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
  },
];

const GAMES = [
  { label: "Sudoku", emoji: "🔢", href: "/games/sudoku", desc: "9×9 grid puzzle" },
  { label: "2048", emoji: "🎮", href: "/games/2048", desc: "Slide & merge tiles" },
  { label: "Chess", emoji: "♟", href: "/games/chess", desc: "Full AI minimax" },
  { label: "Tic Tac Toe", emoji: "⭕", href: "/games/tictactoe", desc: "Unbeatable bot" },
];

const CP_STATS = [
  { icon: Target, label: "Problems Solved", value: "500+", color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  { icon: Flame, label: "Active Streak", value: "Daily Practice", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { icon: Zap, label: "Core Areas", value: "DP · Graphs · Trees", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-purple-50/40 dark:from-gray-950 dark:via-indigo-950/40 dark:to-purple-950/30" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20"
          style={{ backgroundImage: "radial-gradient(#e0e7ff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto w-full py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            2nd Year MnC · IIT Guwahati · Open Source
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-gray-900 dark:text-white mb-6 max-w-4xl">
            Your Complete{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Competitive Programming
            </span>
            {" "}&amp; Developer Toolkit
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Track stats, solve problems, compete in contests, build projects, and level up your coding journey — all in one place.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/codeforces"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02]">
              Explore CP <BarChart2 size={15} />
            </Link>
            <Link href="/compiler"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-white/5 backdrop-blur text-gray-800 dark:text-white font-semibold text-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 hover:scale-[1.02]">
              <Play size={14} /> Open Compiler
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">What&apos;s Inside</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Everything You Need to Level Up</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">Six powerful tools, one unified developer hub.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, href, cta, accent, bg, text }) => (
              <Link key={href} href={href}
                className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent}`} />
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className={text} />
                </div>
                <h3 className={`font-bold text-gray-900 dark:text-white mb-2 group-hover:${text} transition-colors`}>{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">{desc}</p>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${text}`}>
                  {cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES PREVIEW ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Games</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Play &amp; Earn Coins</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Four fully-featured games with a shared global coin system.</p>
            </div>
            <Link href="/games" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors shrink-0">
              Explore All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map(({ label, emoji, href, desc }) => (
              <Link key={href} href={href}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{emoji}</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">{desc}</p>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Play Now <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CP / DSA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">CP & DSA</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                Competitive Programming &amp; Problem Solving
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Daily practice on Codeforces and LeetCode. Strong foundations in algorithm design with a focus on optimization and clean solution architecture.
              </p>
              <div className="flex gap-3 mt-5">
                <a href="https://codeforces.com/profile/RohitN22595" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium hover:opacity-80 transition">
                  <ExternalLink size={11} /> Codeforces
                </a>
                <a href="https://leetcode.com/u/RohitN22595/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-medium hover:opacity-80 transition">
                  <ExternalLink size={11} /> LeetCode
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {CP_STATS.map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl ${bg} border border-gray-200/60 dark:border-gray-800`}>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-purple-900">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
          Start your CodeHub journey
        </h2>
        <p className="text-indigo-200 text-sm mb-8 max-w-md mx-auto">
          No sign-up needed. Everything runs in your browser. Start tracking now.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/codeforces"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition shadow-lg">
            Explore CP <ArrowRight size={15} />
          </Link>
          <Link href="/games"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur text-white font-semibold text-sm hover:bg-white/20 transition">
            <Gamepad2 size={15} /> Play Games
          </Link>
        </div>
      </section>
    </div>
  );
}
