"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import QuestionTable from "@/components/QuestionTable";
import { Question } from "@/lib/types";

const STORAGE_KEY = "code_store_questions";


export default function CodeStorePage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [search, setSearch] = useState("");
    const [nextId, setNextId] = useState(1);
    const [mounted, setMounted] = useState(false);

    // ── Load from localStorage on mount ──────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: Question[] = JSON.parse(raw);
                setQuestions(parsed);
                // Restore nextId so new IDs don't collide
                if (parsed.length > 0) {
                    setNextId(Math.max(...parsed.map((q) => q.id)) + 1);
                }
            }
        } catch { /* ignore parse errors */ }
        setMounted(true);
    }, []);

    // ── Persist to localStorage whenever questions change ─────────────────────
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
        }
    }, [questions, mounted]);

    const addQuestion = () => {
        const newQ: Question = {
            id: nextId,
            name: "", leetcodeLink: "", gfgLink: "",
            youtubeLink: "", description: "", important: false,
        };
        setNextId((n) => n + 1);
        setQuestions((prev) => [...prev, newQ]);
    };

    const updateQuestion = (id: number, updated: Partial<Question>) =>
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));

    const deleteQuestion = (id: number) =>
        setQuestions((prev) => prev.filter((q) => q.id !== id));

    const toggleImportant = (id: number) =>
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, important: !q.important } : q)));

    const filtered = questions.filter((q) =>
        q.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-56px-180px)]">
            {/* Actions bar */}
            <div className="sticky top-14 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">📚 Code Store</span>
                        <span className="text-xs text-gray-400">({questions.length} questions)</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by question name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <button
                            onClick={addQuestion}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow shrink-0"
                        >
                            <Plus size={15} /> Add Question
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-2 sm:px-6 py-6">
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400 dark:text-gray-600">
                        <span className="text-6xl">📋</span>
                        <p className="text-lg font-medium">No questions yet.</p>
                        <p className="text-sm">Click &quot;Add Question&quot; to track your first problem.</p>
                    </div>
                ) : (
                    <QuestionTable
                        questions={filtered}
                        allCount={questions.length}
                        onUpdate={updateQuestion}
                        onDelete={deleteQuestion}
                        onToggleImportant={toggleImportant}
                    />
                )}
            </main>
        </div>
    );
}
