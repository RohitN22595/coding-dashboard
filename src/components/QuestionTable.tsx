"use client";

import { Question } from "@/lib/types";
import QuestionRow from "./QuestionRow";

interface Props {
    questions: Question[];   // filtered list
    allCount: number;        // total (unfiltered) count for empty-filter msg
    onUpdate: (id: number, updated: Partial<Question>) => void;
    onDelete: (id: number) => void;
    onToggleImportant: (id: number) => void;
}

const HEADERS = [
    "S.No",
    "Question Name",
    "LeetCode",
    "GeeksforGeeks",
    "YouTube",
    "Description",
    "Important",
    "Actions",
];

export default function QuestionTable({
    questions,
    allCount,
    onUpdate,
    onDelete,
    onToggleImportant,
}: Props) {
    if (questions.length === 0 && allCount > 0) {
        /* Search returned no results */
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600">
                <span className="text-5xl">🔍</span>
                <p className="text-base font-medium">No questions match your search.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <table className="min-w-full border-collapse text-sm">
                {/* ── Column headers ── */}
                <thead>
                    <tr className="bg-indigo-600 dark:bg-indigo-700 text-white">
                        {HEADERS.map((h) => (
                            <th
                                key={h}
                                className="px-3 py-3 text-left font-semibold whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* ── Body rows ── */}
                <tbody>
                    {questions.map((q, index) => (
                        <QuestionRow
                            key={q.id}
                            question={q}
                            serial={index + 1}   // S.No auto-recalculates from filtered index
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onToggleImportant={onToggleImportant}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
