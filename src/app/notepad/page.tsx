"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    Check,
    X,
    NotebookPen,
    StickyNote,
} from "lucide-react";

// ── Note colour palette ───────────────────────────────────────────────────────
const NOTE_COLORS = [
    { label: "Default", bg: "bg-white dark:bg-gray-900", border: "border-gray-200 dark:border-gray-700" },
    { label: "Indigo", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800" },
    { label: "Rose", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800" },
    { label: "Amber", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800" },
    { label: "Emerald", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800" },
    { label: "Purple", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800" },
];

const COLOR_DOT: Record<string, string> = {
    Default: "bg-gray-400",
    Indigo: "bg-indigo-500",
    Rose: "bg-rose-500",
    Amber: "bg-amber-500",
    Emerald: "bg-emerald-500",
    Purple: "bg-purple-500",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Note {
    id: string;
    title: string;
    content: string;
    color: string;   // NOTE_COLORS label
    createdAt: string; // ISO string
    updatedAt: string;
}

const STORAGE_KEY = "coding_dashboard_notes";

// ── Helpers ───────────────────────────────────────────────────────────────────
function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── Subcomponent: Add / Edit modal ────────────────────────────────────────────
interface NoteModalProps {
    initial?: Note;
    onSave: (note: Omit<Note, "id" | "createdAt">) => void;
    onClose: () => void;
}

function NoteModal({ initial, onSave, onClose }: NoteModalProps) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [content, setContent] = useState(initial?.content ?? "");
    const [color, setColor] = useState(initial?.color ?? "Default");
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => { titleRef.current?.focus(); }, []);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) return;
        onSave({ title: title.trim(), content, color, updatedAt: new Date().toISOString() });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {initial ? "Edit Note" : "New Note"}
                    </span>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <X size={17} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-3">
                    <input
                        ref={titleRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="text-base font-semibold w-full bg-transparent border-b border-gray-200 dark:border-gray-700 pb-2 focus:outline-none focus:border-indigo-400 placeholder:text-gray-400 transition"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your note here…"
                        rows={7}
                        className="w-full bg-transparent resize-none text-sm focus:outline-none placeholder:text-gray-400 text-gray-700 dark:text-gray-300"
                    />

                    {/* Colour picker */}
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-gray-400 mr-1">Color:</span>
                        {NOTE_COLORS.map((c) => (
                            <button
                                key={c.label}
                                title={c.label}
                                onClick={() => setColor(c.label)}
                                className={`w-5 h-5 rounded-full ${COLOR_DOT[c.label]} transition-transform ${color === c.label ? "scale-125 ring-2 ring-offset-1 ring-indigo-500" : "hover:scale-110"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 pb-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() && !content.trim()}
                        className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition flex items-center gap-1.5"
                    >
                        <Check size={14} /> Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotepadPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editing, setEditing] = useState<Note | null>(null);
    const [mounted, setMounted] = useState(false);

    // ── Load from localStorage ────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setNotes(JSON.parse(raw));
        } catch { /* ignore */ }
        setMounted(true);
    }, []);

    // ── Persist to localStorage ───────────────────────────────────────────────
    useEffect(() => {
        if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, [notes, mounted]);

    // ── CRUD ──────────────────────────────────────────────────────────────────
    const addNote = (data: Omit<Note, "id" | "createdAt">) => {
        const now = new Date().toISOString();
        setNotes((prev) => [{ id: newId(), createdAt: now, ...data }, ...prev]);
    };

    const updateNote = (data: Omit<Note, "id" | "createdAt">) => {
        if (!editing) return;
        setNotes((prev) =>
            prev.map((n) => (n.id === editing.id ? { ...n, ...data } : n))
        );
        setEditing(null);
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = notes.filter(
        (n) =>
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-56px-73px)] p-4 sm:p-6">
            {modal === "add" && (
                <NoteModal onSave={addNote} onClose={() => setModal(null)} />
            )}
            {modal === "edit" && editing && (
                <NoteModal initial={editing} onSave={updateNote} onClose={() => { setModal(null); setEditing(null); }} />
            )}

            <div className="max-w-[1400px] mx-auto">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <NotebookPen className="text-indigo-500" size={26} />
                            Notepad
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {notes.length} note{notes.length !== 1 ? "s" : ""} · stored in your browser
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:flex-none sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search notes…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        {/* Add */}
                        <button
                            onClick={() => setModal("add")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow shrink-0"
                        >
                            <Plus size={15} />
                            Add Note
                        </button>
                    </div>
                </div>

                {/* Empty state */}
                {notes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400 dark:text-gray-600">
                        <StickyNote size={56} strokeWidth={1} />
                        <p className="text-lg font-medium">No notes yet.</p>
                        <p className="text-sm">Click &quot;Add Note&quot; to create your first note.</p>
                    </div>
                )}

                {/* No search results */}
                {notes.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600">
                        <Search size={40} strokeWidth={1} />
                        <p className="text-base font-medium">No notes match &quot;{search}&quot;</p>
                    </div>
                )}

                {/* Notes grid */}
                {filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((note) => {
                            const colorInfo = NOTE_COLORS.find((c) => c.label === note.color) ?? NOTE_COLORS[0];
                            return (
                                <div
                                    key={note.id}
                                    className={`group relative flex flex-col rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${colorInfo.bg} ${colorInfo.border}`}
                                >
                                    {/* Color dot */}
                                    <span
                                        className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${COLOR_DOT[note.color]}`}
                                    />

                                    {/* Title */}
                                    {note.title && (
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 pr-5 mb-1 leading-tight line-clamp-2">
                                            {note.title}
                                        </h3>
                                    )}

                                    {/* Content */}
                                    {note.content && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-6 flex-1">
                                            {note.content}
                                        </p>
                                    )}

                                    {/* Date + Actions */}
                                    <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {formatDate(note.updatedAt || note.createdAt)}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditing(note); setModal("edit"); }}
                                                className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => deleteNote(note.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
