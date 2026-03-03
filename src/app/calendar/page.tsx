"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, Loader2, AlertCircle, Clock, Trophy, ChevronRight, ExternalLink } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Contest {
    id: number;
    name: string;
    type: string;
    phase: string;
    durationSeconds: number;
    startTimeSeconds: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(epoch: number) {
    return new Date(epoch * 1000).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatDuration(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function relativeTime(epoch: number): string {
    const now = Date.now();
    const diff = epoch * 1000 - now;
    if (diff <= 0) return "Started";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
}

function dateKey(d: Date) {
    return d.toISOString().split("T")[0];
}

function epochKey(epoch: number) {
    return new Date(epoch * 1000).toISOString().split("T")[0];
}

/** Detect division from contest name */
function contestTag(name: string): { label: string; color: string } {
    if (/div\.?\s*1[^2-4]/i.test(name)) return { label: "Div.1", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" };
    if (/div\.?\s*2/i.test(name)) return { label: "Div.2", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" };
    if (/div\.?\s*3/i.test(name)) return { label: "Div.3", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" };
    if (/div\.?\s*4/i.test(name)) return { label: "Div.4", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" };
    if (/educational/i.test(name)) return { label: "Edu", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" };
    if (/glob/i.test(name)) return { label: "Global", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" };
    return { label: name.split(" ")[0], color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" };
}

export default function CalendarPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [contestMap, setContestMap] = useState<Map<string, Contest[]>>(new Map());
    const [selected, setSelected] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const res = await fetch("https://codeforces.com/api/contest.list?gym=false");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.status !== "OK") throw new Error(data.comment || "API error");
                const upcoming: Contest[] = (data.result as Contest[]).filter(c => c.phase === "BEFORE");
                setContests(upcoming);
                const map = new Map<string, Contest[]>();
                for (const c of upcoming) {
                    const k = epochKey(c.startTimeSeconds);
                    if (!map.has(k)) map.set(k, []);
                    map.get(k)!.push(c);
                }
                setContestMap(map);
            } catch (err) { setError(String(err)); }
            finally { setLoading(false); }
        };
        fetchContests();
    }, []);

    const selectedKey = selected ? dateKey(selected) : null;
    const dayContests = selectedKey ? (contestMap.get(selectedKey) ?? []) : [];

    // Next 5 upcoming contests sorted by start time
    const nextContests = [...contests]
        .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 5);

    return (
        <div className="min-h-[calc(100vh-56px-73px)] p-4 sm:p-6">
            <div className="max-w-[1100px] mx-auto">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <CalendarDays className="text-indigo-500" size={26} />
                        Codeforces Contest Calendar
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {loading ? "Loading upcoming contests…" : `${contests.length} upcoming contest${contests.length !== 1 ? "s" : ""} · Click a highlighted date for details`}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-indigo-500">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-sm font-medium animate-pulse">Fetching contests from Codeforces…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-6">
                        {/* Calendar + sidebar */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
                            {/* Calendar card */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                                <style>{`
                  .react-calendar { width:100%; border:none; background:transparent; font-family:inherit; }
                  .react-calendar__tile { border-radius:10px; padding:10px 4px; color:inherit; transition:.15s; }
                  .react-calendar__tile:hover { background:rgb(99 102 241/.12); }
                  .react-calendar__tile--active,.react-calendar__tile--active:hover { background:#6366f1!important; color:#fff!important; }
                  .react-calendar__tile--now { background:rgb(99 102 241/.15); font-weight:700; }
                  .react-calendar__navigation button { background:transparent; color:inherit; font-weight:600; border-radius:8px; min-width:40px; transition:.15s; }
                  .react-calendar__navigation button:hover { background:rgb(99 102 241/.12); }
                  .react-calendar__month-view__weekdays { font-size:.7rem; font-weight:700; opacity:.5; text-transform:uppercase; }
                  .has-contest { background:rgb(99 102 241/.1)!important; border:2px solid rgb(99 102 241/.5)!important; }
                `}</style>
                                <Calendar
                                    onClickDay={(d) => setSelected(d)}
                                    value={selected}
                                    minDate={new Date()}
                                    tileContent={({ date }) =>
                                        contestMap.has(dateKey(date)) ? (
                                            <div className="flex justify-center mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                                            </div>
                                        ) : null
                                    }
                                    tileClassName={({ date }) =>
                                        contestMap.has(dateKey(date)) ? "has-contest" : null
                                    }
                                />
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                                    Contest scheduled · Click a date to view details
                                </div>
                            </div>

                            {/* Sidebar: selected date or prompt */}
                            <div className="flex flex-col gap-3">
                                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">
                                    {selected
                                        ? selected.toLocaleDateString("en-IN", { dateStyle: "long" })
                                        : "📅 Select a highlighted date"}
                                </div>

                                {selected && dayContests.length === 0 && (
                                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                                        No contests on this date.
                                    </div>
                                )}

                                {dayContests.map((c) => {
                                    const tag = contestTag(c.name);
                                    return (
                                        <div key={c.id} className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Trophy size={15} className="text-indigo-500 mt-0.5 shrink-0" />
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                                                    {c.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tag.color}`}>{tag.label}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{c.type}</span>
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5"><Clock size={12} />{formatTime(c.startTimeSeconds)}</div>
                                                <div className="flex items-center gap-1.5"><ChevronRight size={12} />Duration: {formatDuration(c.durationSeconds)}</div>
                                                <div className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
                                                    <ChevronRight size={12} />{relativeTime(c.startTimeSeconds)}
                                                </div>
                                            </div>
                                            <a
                                                href={`https://codeforces.com/contest/${c.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                View on Codeforces <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    );
                                })}

                                {!selected && (
                                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                        Purple-bordered dates have upcoming contests.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming contest cards strip */}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">⚡ Next 5 Upcoming Contests</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {nextContests.map((c) => {
                                    const tag = contestTag(c.name);
                                    return (
                                        <a
                                            key={c.id}
                                            href={`https://codeforces.com/contest/${c.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                    {c.name}
                                                </span>
                                                <ExternalLink size={12} className="shrink-0 text-gray-400 mt-0.5" />
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tag.color}`}>{tag.label}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                                <p>{formatTime(c.startTimeSeconds)}</p>
                                                <p className="font-medium text-indigo-600 dark:text-indigo-400">{relativeTime(c.startTimeSeconds)}</p>
                                                <p>Duration: {formatDuration(c.durationSeconds)}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
