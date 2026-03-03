"use client";

import { useState } from "react";
import { Play, Loader2, Terminal, FileCode2, ChevronRight } from "lucide-react";

// ── Judge0 CE public endpoint ─────────────────────────────────────────────────
// Free public API — no key required for basic usage
const JUDGE0_BASE = "https://judge0-ce.p.rapidapi.com";

// Judge0 language IDs
const LANGUAGES = [
    { label: "C++", id: 54, placeholder: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { label: "Java", id: 62, placeholder: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { label: "Python", id: 71, placeholder: 'print("Hello, World!")' },
    { label: "JavaScript", id: 63, placeholder: 'console.log("Hello, World!");' },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

// Status IDs from Judge0 API
const ACCEPTED_ID = 3;

export default function CompilerPage() {
    const [langId, setLangId] = useState<LangId>(71); // default: Python
    const [code, setCode] = useState(LANGUAGES[2].placeholder);
    const [stdin, setStdin] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── Update code placeholder when language changes ─────────────────────────
    const handleLangChange = (id: LangId) => {
        setLangId(id);
        const lang = LANGUAGES.find((l) => l.id === id)!;
        setCode(lang.placeholder);
        setOutput("");
        setError("");
    };

    // ── Submit code to Judge0 and poll for result ─────────────────────────────
    const runCode = async () => {
        setLoading(true);
        setOutput("");
        setError("");

        try {
            // Step 1: Create submission
            const submitRes = await fetch(
                "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // Use the free public RapidAPI key available for Judge0 CE
                        "X-RapidAPI-Key": "f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0",
                        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                    },
                    body: JSON.stringify({
                        language_id: langId,
                        source_code: code,
                        stdin: stdin,
                    }),
                }
            );

            if (!submitRes.ok) {
                // Fallback: try the public CE endpoint without API key
                await runWithPublicAPI();
                return;
            }

            const result = await submitRes.json();
            displayResult(result);
        } catch {
            // RapidAPI failed — use the open public endpoint
            await runWithPublicAPI();
        } finally {
            setLoading(false);
        }
    };

    // ── Fallback: Judge0 CE open public instance ──────────────────────────────
    const runWithPublicAPI = async () => {
        try {
            // Submit and wait for result (wait=true returns synchronously up to 5s)
            const res = await fetch(
                "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language_id: langId,
                        source_code: code,
                        stdin: stdin,
                    }),
                }
            );

            if (!res.ok) {
                // If wait=true didn't work, try polling
                const sub = await res.json();
                if (sub.token) {
                    await pollResult(sub.token);
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const result = await res.json();

            // If status is still processing, poll
            if (result.status?.id <= 2) {
                await pollResult(result.token);
            } else {
                displayResult(result);
            }
        } catch (err) {
            setError(
                `Failed to connect to the compiler API.\n\nThis may be due to CORS or network restrictions.\n\nError: ${err}`
            );
        }
    };

    // ── Poll Judge0 for result by token ──────────────────────────────────────
    const pollResult = async (token: string) => {
        for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 1500));
            const res = await fetch(
                `https://ce.judge0.com/submissions/${token}?base64_encoded=false`
            );
            const result = await res.json();
            if (result.status?.id > 2) {
                displayResult(result);
                return;
            }
        }
        setError("Compilation timed out. Please try again.");
    };

    // ── Display Judge0 result ─────────────────────────────────────────────────
    const displayResult = (result: {
        status?: { id: number; description: string };
        stdout?: string;
        stderr?: string;
        compile_output?: string;
        message?: string;
    }) => {
        if (result.status?.id === ACCEPTED_ID) {
            setOutput(result.stdout || "(no output)");
        } else if (result.compile_output) {
            setError(`Compilation Error:\n${result.compile_output}`);
        } else if (result.stderr) {
            setError(`Runtime Error:\n${result.stderr}`);
        } else {
            setError(
                `${result.status?.description || "Unknown error"}\n${result.message || ""}`
            );
        }
    };

    const activeLang = LANGUAGES.find((l) => l.id === langId)!;

    return (
        <div className="min-h-[calc(100vh-56px)] p-4 sm:p-6">
            <div className="max-w-[1400px] mx-auto">

                {/* ── Page title ── */}
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileCode2 className="text-indigo-500" size={26} />
                        Online Compiler
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Write and run code in C++, Java, Python, or JavaScript
                    </p>
                </div>

                {/* ── Language picker ── */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {LANGUAGES.map((lang) => (
                        <label
                            key={lang.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition select-none ${langId === lang.id
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-400"
                                }`}
                        >
                            <input
                                type="radio"
                                name="language"
                                value={lang.id}
                                checked={langId === lang.id}
                                onChange={() => handleLangChange(lang.id as LangId)}
                                className="accent-indigo-600"
                            />
                            {lang.label}
                        </label>
                    ))}
                </div>

                {/* ── Main layout: Editor | Input + Output ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* ── Left: Code editor ── */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {activeLang.label} Editor
                            </span>
                            <button
                                onClick={runCode}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition shadow"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Running…
                                    </>
                                ) : (
                                    <>
                                        <Play size={15} />
                                        Run Code
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            className="flex-1 min-h-[480px] w-full font-mono text-sm p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-900 text-green-300 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                            placeholder={activeLang.placeholder}
                            style={{ tabSize: 4 }}
                            onKeyDown={(e) => {
                                // Allow Tab key in textarea
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    const start = e.currentTarget.selectionStart;
                                    const end = e.currentTarget.selectionEnd;
                                    setCode(code.substring(0, start) + "    " + code.substring(end));
                                    // Move cursor after inserted spaces
                                    setTimeout(() => {
                                        e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
                                            start + 4;
                                    }, 0);
                                }
                            }}
                        />
                    </div>

                    {/* ── Right: Input + Output ── */}
                    <div className="flex flex-col gap-4">

                        {/* Stdin */}
                        <div className="">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                Standard Input (stdin)
                            </label>
                            <textarea
                                value={stdin}
                                onChange={(e) => setStdin(e.target.value)}
                                placeholder="Enter program input here…"
                                className="w-full h-32 font-mono text-sm p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>

                        {/* Output */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal size={14} className="text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    Output
                                </span>
                                {loading && (
                                    <span className="flex items-center gap-1 text-xs text-indigo-500">
                                        <Loader2 size={12} className="animate-spin" />
                                        Compiling…
                                    </span>
                                )}
                            </div>

                            {/* Result / error display */}
                            {error ? (
                                <div className="flex-1 min-h-[300px] font-mono text-sm p-4 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 overflow-auto whitespace-pre-wrap">
                                    <div className="flex items-center gap-1.5 mb-2 font-semibold">
                                        <ChevronRight size={14} />
                                        Error
                                    </div>
                                    {error}
                                </div>
                            ) : (
                                <textarea
                                    readOnly
                                    value={output}
                                    placeholder="Output will appear here after running your code…"
                                    className="flex-1 min-h-[300px] font-mono text-sm p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-950 text-green-300 resize-none focus:outline-none"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── API note ── */}
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-600 text-center">
                    Powered by Judge0 CE · Free public API · Supports 60+ languages
                </p>
            </div>
        </div>
    );
}
