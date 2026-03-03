"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Trash2, Check, CheckSquare, Clock,
    ChevronDown, ChevronUp, StickyNote,
} from "lucide-react";

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
    completedAt?: string;
}

const STORAGE_KEY = "coding_dashboard_todos";

function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TodoPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);
    // Add form
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    // Filter
    const [filter, setFilter] = useState<"all" | "active" | "done">("all");

    useEffect(() => {
        try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setTasks(JSON.parse(raw)); } catch { }
        setMounted(true);
    }, []);

    useEffect(() => { if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks, mounted]);

    const addTask = () => {
        if (!title.trim()) return;
        const now = new Date().toISOString();
        setTasks(p => [{ id: newId(), title: title.trim(), description: desc.trim(), completed: false, createdAt: now }, ...p]);
        setTitle(""); setDesc(""); setFormOpen(false);
    };

    const toggleTask = (id: string) => setTasks(p =>
        p.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t)
    );

    const deleteTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

    const filtered = tasks
        .filter(t => (filter === "active" ? !t.completed : filter === "done" ? t.completed : true))
        .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

    const doneCount = tasks.filter(t => t.completed).length;
    const activeCount = tasks.filter(t => !t.completed).length;

    return (
        <div className="min-h-[calc(100vh-56px-180px)] p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <CheckSquare className="text-rose-500" size={26} /> Todo
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {activeCount} active · {doneCount} done · {tasks.length} total
                    </p>
                </div>

                {/* Add task area */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-5 overflow-hidden">
                    <button
                        onClick={() => setFormOpen(o => !o)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <Plus size={16} className="text-rose-500" />
                        <span>Add new task…</span>
                        <span className="ml-auto">{formOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                    </button>

                    {formOpen && (
                        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
                            <input
                                autoFocus
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addTask()}
                                placeholder="Task title *"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                            />
                            <textarea
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder="Description (optional)"
                                rows={2}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setFormOpen(false); setTitle(""); setDesc(""); }}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                    Cancel
                                </button>
                                <button onClick={addTask} disabled={!title.trim()}
                                    className="text-xs px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium transition flex items-center gap-1">
                                    <Plus size={12} /> Add Task
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 transition" />
                    </div>
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden text-xs font-medium">
                        {(["all", "active", "done"] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-2 capitalize transition ${filter === f ? "bg-rose-500 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center py-24 gap-3 text-gray-400 dark:text-gray-600">
                        <StickyNote size={48} strokeWidth={1} />
                        <p className="text-base font-medium">No tasks yet</p>
                        <p className="text-sm">Click &quot;Add new task&quot; to get started</p>
                    </div>
                )}

                {/* Task list */}
                <div className="flex flex-col gap-2">
                    {filtered.map(task => (
                        <div
                            key={task.id}
                            className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 ${task.completed
                                    ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-70"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                }`}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed
                                        ? "bg-rose-500 border-rose-500"
                                        : "border-gray-400 dark:border-gray-600 hover:border-rose-400"
                                    }`}
                            >
                                {task.completed && <Check size={11} className="text-white" strokeWidth={3} />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold leading-tight ${task.completed ? "line-through text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-gray-100"}`}>
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{task.description}</p>
                                )}
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 dark:text-gray-600">
                                    <Clock size={10} />
                                    {task.completed && task.completedAt ? `Completed ${formatDate(task.completedAt)}` : `Created ${formatDate(task.createdAt)}`}
                                </div>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 transition-all"
                                title="Delete"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}

                    {tasks.length > 0 && filtered.length === 0 && (
                        <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">No tasks match your search / filter.</div>
                    )}
                </div>

                {/* Clear done */}
                {doneCount > 0 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setTasks(p => p.filter(t => !t.completed))}
                            className="text-xs text-gray-400 hover:text-red-500 transition"
                        >
                            Clear {doneCount} completed task{doneCount > 1 ? "s" : ""}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
