"use client";

import { useState } from "react";
import {
    Search, Loader2, AlertCircle, Trophy, CheckCircle,
    BarChart2, Target, Zap, Clock, Code2,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LCStats {
    status: string;
    totalSolved: number;
    totalQuestions: number;
    easySolved: number;
    totalEasy: number;
    mediumSolved: number;
    totalMedium: number;
    hardSolved: number;
    totalHard: number;
    acceptanceRate: number;
    ranking: number;
    contributionPoints: number;
    reputation: number;
}

interface RecentSubmission {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} className="text-white" />
            </div>
            <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</div>
                {sub && <div className="text-[11px] text-gray-400">{sub}</div>}
            </div>
        </div>
    );
}

// ── Difficulty progress bar ───────────────────────────────────────────────────
function DiffBar({
    label, solved, total, color,
}: { label: string; solved: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
                <span className={`font-semibold ${color}`}>{label}</span>
                <span className="text-gray-600 dark:text-gray-400 text-xs">{solved} / {total}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color.replace("text-", "bg-")}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function LeetCodePage() {
    const [username, setUsername] = useState("");
    const [stats, setStats] = useState<LCStats | null>(null);
    const [recent, setRecent] = useState<RecentSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Fetch from lcdev.vercel.app / alfa-leetcode-api ──────────────────────
    const fetchStats = async () => {
        if (!username.trim()) return;
        setLoading(true);
        setError("");
        setStats(null);
        setRecent([]);

        try {
            // Primary: alfa-leetcode-api (no auth, CORS ok)
            const [statsRes, recentRes] = await Promise.all([
                fetch(`https://leetcode-stats-api.herokuapp.com/${username.trim()}`),
                fetch(`https://alfa-leetcode-api.onrender.com/${username.trim()}/submission?limit=10`).catch(() => null),
            ]);

            if (!statsRes.ok) throw new Error(`User "${username}" not found`);
            const data: LCStats = await statsRes.json();
            if (data.status === "error") throw new Error(`User "${username}" not found`);
            setStats(data);

            // Recent submissions (optional endpoint)
            if (recentRes?.ok) {
                const rData = await recentRes.json();
                setRecent(rData.submission ?? []);
            }
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    };

    // ── Chart data ────────────────────────────────────────────────────────────
    const pieData = stats
        ? [
            { name: "Easy", value: stats.easySolved, fill: "#22c55e" },
            { name: "Medium", value: stats.mediumSolved, fill: "#f59e0b" },
            { name: "Hard", value: stats.hardSolved, fill: "#ef4444" },
        ]
        : [];

    const barData = stats
        ? [
            { name: "Easy", solved: stats.easySolved, total: stats.totalEasy },
            { name: "Medium", solved: stats.mediumSolved, total: stats.totalMedium },
            { name: "Hard", solved: stats.hardSolved, total: stats.totalHard },
        ]
        : [];

    // Verdict class
    const verdictClass = (status: string) => {
        if (status === "Accepted") return "text-green-600 dark:text-green-400";
        if (status.includes("Wrong")) return "text-red-500";
        return "text-yellow-500";
    };

    return (
        <div className="min-h-[calc(100vh-56px-73px)] p-4 sm:p-6">
            <div className="max-w-[1100px] mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={26} />
                        LeetCode Stats
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Enter a LeetCode username to view stats.
                    </p>
                </div>

                {/* Search */}
                <div className="flex gap-2 mb-8">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="LeetCode username…"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchStats()}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        />
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading || !username.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white text-sm font-medium transition shadow"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        {loading ? "Loading…" : "Search"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 mb-6">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Stats */}
                {stats && (
                    <div className="space-y-6">
                        {/* Basic stat cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <StatCard icon={CheckCircle} label="Total Solved" value={stats.totalSolved} sub={`of ${stats.totalQuestions}`} color="bg-indigo-500" />
                            <StatCard icon={Target} label="Acceptance Rate" value={`${stats.acceptanceRate?.toFixed(1)}%`} color="bg-green-500" />
                            <StatCard icon={BarChart2} label="Global Rank" value={stats.ranking?.toLocaleString() || "—"} color="bg-purple-500" />
                            <StatCard icon={Zap} label="Contribution" value={stats.contributionPoints || "—"} color="bg-orange-500" />
                        </div>

                        {/* Difficulty breakdown + pie chart */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bar chart */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Problems by Difficulty</h3>
                                <div className="space-y-3 mb-4">
                                    <DiffBar label="Easy" solved={stats.easySolved} total={stats.totalEasy} color="text-green-500" />
                                    <DiffBar label="Medium" solved={stats.mediumSolved} total={stats.totalMedium} color="text-amber-500" />
                                    <DiffBar label="Hard" solved={stats.hardSolved} total={stats.totalHard} color="text-red-500" />
                                </div>
                                <ResponsiveContainer width="100%" height={150}>
                                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="solved" radius={[4, 4, 0, 0]}>
                                            {barData.map((_, i) => (
                                                <Cell key={i} fill={["#22c55e", "#f59e0b", "#ef4444"][i]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie chart */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Solved Distribution</h3>
                                <div className="flex-1 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent submissions */}
                        {recent.length > 0 && (
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <Clock size={14} /> Recent Submissions
                                </h3>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recent.slice(0, 10).map((s, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Code2 size={13} className="text-gray-400 shrink-0" />
                                                <a
                                                    href={`https://leetcode.com/problems/${s.titleSlug}/`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="truncate hover:text-yellow-500 transition font-medium"
                                                >
                                                    {s.title}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className="text-xs text-gray-400">{s.lang}</span>
                                                <span className={`text-xs font-medium ${verdictClass(s.statusDisplay)}`}>
                                                    {s.statusDisplay}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty prompt */}
                {!loading && !error && !stats && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600">
                        <Trophy size={52} strokeWidth={1} />
                        <p className="text-base font-medium">Enter a LeetCode username to get started</p>
                        <p className="text-sm">e.g. neal_wu, tourist, RohitN22595</p>
                    </div>
                )}
            </div>
        </div>
    );
}
