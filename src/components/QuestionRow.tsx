"use client";

import { useState } from "react";
import {
    Star,
    Trash2,
    Pencil,
    Check,
    X,
    ExternalLink,
} from "lucide-react";
import { Question } from "@/lib/types";

interface Props {
    question: Question;
    serial: number;
    onUpdate: (id: number, updated: Partial<Question>) => void;
    onDelete: (id: number) => void;
    onToggleImportant: (id: number) => void;
}

export default function QuestionRow({
    question,
    serial,
    onUpdate,
    onDelete,
    onToggleImportant,
}: Props) {
    // ── Local edit state ──
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Question>({ ...question });

    /** Enter edit mode: snapshot current values */
    const startEdit = () => {
        setDraft({ ...question });
        setEditing(true);
    };

    /** Commit changes */
    const saveEdit = () => {
        onUpdate(question.id, {
            name: draft.name,
            leetcodeLink: draft.leetcodeLink,
            gfgLink: draft.gfgLink,
            youtubeLink: draft.youtubeLink,
            description: draft.description,
        });
        setEditing(false);
    };

    /** Discard changes */
    const cancelEdit = () => setEditing(false);

    // Zebra striping helper
    const rowBase =
        "border-b border-gray-100 dark:border-gray-800 transition-colors";
    const rowColor =
        serial % 2 === 0
            ? "bg-white dark:bg-gray-900"
            : "bg-gray-50 dark:bg-gray-950";

    return (
        <tr className={`${rowBase} ${rowColor} hover:bg-indigo-50 dark:hover:bg-indigo-950/30`}>
            {/* S.No */}
            <td className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400 w-12">
                {serial}
            </td>

            {/* Question Name */}
            <td className="px-3 py-2 min-w-[160px]">
                {editing ? (
                    <input
                        className={inputCls}
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder="Question name"
                        autoFocus
                    />
                ) : (
                    <span className="font-medium">{question.name || <span className="text-gray-400 italic">—</span>}</span>
                )}
            </td>

            {/* LeetCode Link */}
            <td className="px-3 py-2 min-w-[140px]">
                {editing ? (
                    <input
                        className={inputCls}
                        value={draft.leetcodeLink}
                        onChange={(e) => setDraft({ ...draft, leetcodeLink: e.target.value })}
                        placeholder="https://leetcode.com/…"
                    />
                ) : (
                    <LinkCell href={question.leetcodeLink} label="LeetCode" color="text-orange-500" />
                )}
            </td>

            {/* GeeksforGeeks Link */}
            <td className="px-3 py-2 min-w-[140px]">
                {editing ? (
                    <input
                        className={inputCls}
                        value={draft.gfgLink}
                        onChange={(e) => setDraft({ ...draft, gfgLink: e.target.value })}
                        placeholder="https://geeksforgeeks.org/…"
                    />
                ) : (
                    <LinkCell href={question.gfgLink} label="GFG" color="text-green-600" />
                )}
            </td>

            {/* YouTube Link */}
            <td className="px-3 py-2 min-w-[140px]">
                {editing ? (
                    <input
                        className={inputCls}
                        value={draft.youtubeLink}
                        onChange={(e) => setDraft({ ...draft, youtubeLink: e.target.value })}
                        placeholder="https://youtube.com/…"
                    />
                ) : (
                    <LinkCell href={question.youtubeLink} label="YouTube" color="text-red-500" />
                )}
            </td>

            {/* Description */}
            <td className="px-3 py-2 min-w-[200px] max-w-[280px]">
                {editing ? (
                    <textarea
                        className={`${inputCls} resize-none h-16`}
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        placeholder="Notes / description…"
                    />
                ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {question.description || <span className="italic text-gray-400">—</span>}
                    </p>
                )}
            </td>

            {/* Important (star toggle) */}
            <td className="px-3 py-2 text-center">
                <button
                    onClick={() => onToggleImportant(question.id)}
                    title={question.important ? "Unmark important" : "Mark as important"}
                    className="transition-transform hover:scale-125"
                >
                    <Star
                        size={20}
                        className={
                            question.important
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                        }
                    />
                </button>
            </td>

            {/* Actions */}
            <td className="px-3 py-2 whitespace-nowrap">
                {editing ? (
                    <div className="flex gap-1.5">
                        {/* Save */}
                        <button
                            onClick={saveEdit}
                            title="Save"
                            className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900 transition"
                        >
                            <Check size={15} />
                        </button>
                        {/* Cancel */}
                        <button
                            onClick={cancelEdit}
                            title="Cancel"
                            className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <X size={15} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-1.5">
                        {/* Edit */}
                        <button
                            onClick={startEdit}
                            title="Edit"
                            className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition"
                        >
                            <Pencil size={15} />
                        </button>
                        {/* Delete */}
                        <button
                            onClick={() => onDelete(question.id)}
                            title="Delete"
                            className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────
// Sub-component: external link cell
// ─────────────────────────────────────────────
function LinkCell({
    href,
    label,
    color,
}: {
    href: string;
    label: string;
    color: string;
}) {
    if (!href)
        return <span className="text-gray-400 italic text-xs">—</span>;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 ${color} hover:opacity-75 transition`}
        >
            {label}
            <ExternalLink size={11} />
        </a>
    );
}

// Shared input/textarea class
const inputCls =
    "w-full text-xs px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
