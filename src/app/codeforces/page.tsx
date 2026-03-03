"use client";

import { useState } from "react";
import {
    Search, Loader2, AlertCircle, BarChart2,
    Award, TrendingUp, Star, Zap, Users, CheckCircle2,
    Activity, Target, Calendar, Hash,
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar, Cell,
} from "recharts";

// ── Codeforces types ──────────────────────────────────────────────────────────
interface CFUser {
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
    contribution?: number;
    friendOfCount?: number;
    titlePhoto?: string;
}
interface CFSubmission {
    id: number;
    verdict: string;
    creationTimeSeconds: number;
    problem: { contestId?: number; index: string; rating?: number; name: string };
}
interface CFContest {
    id: number;
    name: string;
    phase: string;
    startTimeSeconds: number;
}
interface RatingChange {
    contestId: number;
    contestName: string;
    newRating: number;
    oldRating: number;
    ratingUpdateTimeSeconds: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const WEEKS = 52;
const DAYS_PER_WEEK = 7;
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function capRank(r?: string) { return r ? r.charAt(0).toUpperCase() + r.slice(1) : "—"; }
function dayKeyOffset(offset: number): string {
    const d = new Date(); d.setDate(d.getDate() - offset);
    return d.toISOString().split("T")[0];
}
function epochDayKey(e: number) { return new Date(e * 1000).toISOString().split("T")[0]; }
function heatColor(count: number) {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    if (count <= 2) return "bg-indigo-200 dark:bg-indigo-900";
    if (count <= 5) return "bg-indigo-400 dark:bg-indigo-700";
    if (count <= 10) return "bg-indigo-500 dark:bg-indigo-500";
    return "bg-indigo-700 dark:bg-indigo-400";
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className={`p-2 rounded-lg ${color} shrink-0`}><Icon size={17} className="text-white" /></div>
            <div className="min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{label}</div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{value}</div>
                {sub && <div className="text-[10px] text-gray-400 truncate">{sub}</div>}
            </div>
        </div>
    );
}

// ── Custom tooltip for rating chart ──────────────────────────────────────────
function RatingTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow text-xs">
            <p className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[160px]">{label}</p>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold">Rating: {payload[0].value}</p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CodeforceStatsPage() {
    const [handle, setHandle] = useState("");
    const [user, setUser] = useState<CFUser | null>(null);
    const [heatmap, setHeatmap] = useState<Map<string, number>>(new Map());
    const [ratingHistory, setRatingHistory] = useState<RatingChange[]>([]);
    const [dayActivity, setDayActivity] = useState<{ day: string; count: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Advanced stats
    const [solvedCount, setSolvedCount] = useState(0);
    const [solved30d, setSolved30d] = useState(0);
    const [totalSubs, setTotalSubs] = useState(0);
    const [acceptedSubs, setAcceptedSubs] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [topRatingRange, setTopRatingRange] = useState("");
    const [mostActiveDay, setMostActiveDay] = useState("");

    const fetchUser = async () => {
        if (!handle.trim()) return;
        setLoading(true);
        setError("");
        setUser(null);
        setHeatmap(new Map());
        setRatingHistory([]);
        setSolvedCount(0); setSolved30d(0); setTotalSubs(0); setAcceptedSubs(0);
        setAvgRating(0); setTopRatingRange(""); setMostActiveDay("");

        try {
            const [infoR, statusR, ratingR] = await Promise.all([
                fetch(`https://codeforces.com/api/user.info?handles=${handle.trim()}`),
                fetch(`https://codeforces.com/api/user.status?handle=${handle.trim()}&from=1&count=10000`),
                fetch(`https://codeforces.com/api/user.rating?handle=${handle.trim()}`),
            ]);
            if (!infoR.ok) throw new Error("Network error");
            const infoData = await infoR.json();
            if (infoData.status !== "OK") throw new Error(infoData.comment || "User not found");
            setUser(infoData.result[0]);

            const statusData = await statusR.json();
            if (statusData.status !== "OK") throw new Error(statusData.comment || "Failed to load submissions");
            const subs: CFSubmission[] = statusData.result;

            // ── Heatmap ────────────────────────────────────────────────────────────
            const hMap = new Map<string, number>();
            const solved = new Set<string>();
            const now30 = Date.now() - 30 * 86400000;
            let totalAccepted = 0;
            const ratingBuckets: Record<string, number> = {};
            let ratingSum = 0; let ratingCnt = 0;
            const dayCounts = new Array(7).fill(0);

            for (const s of subs) {
                const k = epochDayKey(s.creationTimeSeconds);
                hMap.set(k, (hMap.get(k) ?? 0) + 1);
                const dow = new Date(s.creationTimeSeconds * 1000).getDay();
                dayCounts[dow]++;

                if (s.verdict === "OK") {
                    const pid = `${s.problem.contestId ?? "x"}_${s.problem.index}`;
                    if (!solved.has(pid)) {
                        solved.add(pid);
                        if (s.problem.rating) {
                            const bucket = `${Math.floor(s.problem.rating / 500) * 500}–${Math.floor(s.problem.rating / 500) * 500 + 499}`;
                            ratingBuckets[bucket] = (ratingBuckets[bucket] ?? 0) + 1;
                            ratingSum += s.problem.rating; ratingCnt++;
                        }
                        if (s.creationTimeSeconds * 1000 >= now30) setSolved30d(p => p + 1);
                    }
                    totalAccepted++;
                }
            }
            setHeatmap(hMap);
            setSolvedCount(solved.size);
            setTotalSubs(subs.length);
            setAcceptedSubs(totalAccepted);
            if (ratingCnt > 0) setAvgRating(Math.round(ratingSum / ratingCnt));
            if (Object.keys(ratingBuckets).length > 0) {
                setTopRatingRange(Object.entries(ratingBuckets).sort((a, b) => b[1] - a[1])[0][0]);
            }
            const maxDay = dayCounts.indexOf(Math.max(...dayCounts));
            setMostActiveDay(DAYS_OF_WEEK[maxDay]);
            setDayActivity(DAYS_OF_WEEK.map((d, i) => ({ day: d, count: dayCounts[i] })));

            // ── Rating history ─────────────────────────────────────────────────────
            if (ratingR.ok) {
                const rData = await ratingR.json();
                if (rData.status === "OK") setRatingHistory(rData.result.slice(-30));
            }
        } catch (err) { setError(String(err)); }
        finally { setLoading(false); }
    };

    // ── Build 52-week grid ────────────────────────────────────────────────────
    const totalDays = WEEKS * DAYS_PER_WEEK;
    const grid = Array.from({ length: totalDays }, (_, i) => {
        const k = dayKeyOffset(totalDays - 1 - i);
        return { key: k, count: heatmap.get(k) ?? 0 };
    });

    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    grid.forEach(({ key }, idx) => {
        const d = new Date(key); const m = d.getMonth();
        if (m !== lastMonth) { monthLabels.push({ label: d.toLocaleString("default", { month: "short" }), weekIndex: Math.floor(idx / 7) }); lastMonth = m; }
    });

    const successRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) : "0";

    // Rating chart data
    const ratingChartData = ratingHistory.map(r => ({
        name: r.contestName.length > 20 ? r.contestName.slice(0, 18) + "…" : r.contestName,
        rating: r.newRating,
    }));

    return (
        <div className="min-h-[calc(100vh-56px-73px)] p-4 sm:p-6">
            <div className="max-w-[1100px] mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <BarChart2 className="text-indigo-500" size={26} />
                        Codeforces Stats
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Deep analytics for any Codeforces user.
                    </p>
                </div>

                {/* Search */}
                <div className="flex gap-2 mb-8">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Codeforces handle…"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchUser()}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                    <button
                        onClick={fetchUser}
                        disabled={loading || !handle.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition shadow"
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

                {user && (
                    <div className="space-y-6">
                        {/* Profile */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                            {user.titlePhoto && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.titlePhoto} alt={user.handle} className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover" />
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.handle}</h2>
                                <p className="text-sm text-indigo-500 font-medium">{capRank(user.rank)}</p>
                            </div>
                        </div>

                        {/* Basic stats: 6 cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <StatCard icon={TrendingUp} label="Rating" value={user.rating ?? "Unrated"} color="bg-indigo-500" />
                            <StatCard icon={Star} label="Max Rating" value={user.maxRating ?? "—"} color="bg-purple-500" />
                            <StatCard icon={Award} label="Max Rank" value={capRank(user.maxRank)} color="bg-pink-500" />
                            <StatCard icon={Zap} label="Contribution" value={user.contribution ?? 0} color="bg-green-500" />
                            <StatCard icon={Users} label="Friend Of" value={user.friendOfCount ?? 0} color="bg-sky-500" />
                            <StatCard icon={BarChart2} label="Solved" value={solvedCount} color="bg-orange-500" />
                        </div>

                        {/* Advanced stats: 6 cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <StatCard icon={Calendar} label="Solved 30d" value={solved30d} color="bg-teal-500" />
                            <StatCard icon={Hash} label="Total Subs" value={totalSubs} color="bg-slate-500" />
                            <StatCard icon={CheckCircle2} label="Accepted" value={acceptedSubs} color="bg-emerald-500" />
                            <StatCard icon={Target} label="Success Rate" value={`${successRate}%`} color="bg-lime-600" />
                            <StatCard icon={Activity} label="Avg Prob Rating" value={avgRating || "—"} color="bg-amber-500" />
                            <StatCard icon={Activity} label="Most Active" value={mostActiveDay || "—"} color="bg-fuchsia-500" />
                        </div>

                        {/* Top rating range + day activity */}
                        {topRatingRange && (
                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Most solved rating range: </span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{topRatingRange}</span>
                            </div>
                        )}

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Rating history chart */}
                            {ratingChartData.length > 0 && (
                                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        📈 Rating History (last {ratingChartData.length} contests)
                                    </h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={ratingChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                            <XAxis dataKey="name" tick={false} />
                                            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                                            <Tooltip content={<RatingTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="rating"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                dot={{ r: 2, fill: "#6366f1" }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Day-of-week activity */}
                            {dayActivity.length > 0 && (
                                <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        📅 Submissions by Day of Week
                                    </h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={dayActivity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {dayActivity.map((d, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={d.day === mostActiveDay ? "#6366f1" : "#a5b4fc"}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Heatmap */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                🔥 Submission Activity — Last 52 Weeks
                            </h3>
                            <div className="overflow-x-auto">
                                <div className="flex mb-1" style={{ gap: 3 }}>
                                    {Array.from({ length: WEEKS }, (_, wi) => {
                                        const ml = monthLabels.find(m => m.weekIndex === wi);
                                        return (
                                            <div key={wi} className="text-[10px] text-gray-400 dark:text-gray-600 shrink-0" style={{ width: 12 }}>
                                                {ml ? ml.label : ""}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex" style={{ gap: 3 }}>
                                    {Array.from({ length: WEEKS }, (_, wi) => (
                                        <div key={wi} className="flex flex-col" style={{ gap: 3 }}>
                                            {Array.from({ length: DAYS_PER_WEEK }, (_, di) => {
                                                const cell = grid[wi * DAYS_PER_WEEK + di];
                                                if (!cell) return null;
                                                return (
                                                    <div
                                                        key={di}
                                                        title={`${cell.key}: ${cell.count} submission${cell.count !== 1 ? "s" : ""}`}
                                                        className={`w-3 h-3 rounded-sm transition-opacity hover:opacity-70 ${heatColor(cell.count)}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                <span>Less</span>
                                {["bg-gray-100 dark:bg-gray-800", "bg-indigo-200", "bg-indigo-400", "bg-indigo-500", "bg-indigo-700"].map((cls, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
                                ))}
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && !user && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600">
                        <BarChart2 size={52} strokeWidth={1} />
                        <p className="text-base font-medium">Enter a handle to get started</p>
                        <p className="text-sm">e.g. tourist, Petr, Um_nik</p>
                    </div>
                )}
            </div>
        </div>
    );
}
