"use client";

import { useState, useEffect, useRef } from "react";
import {
    User, Mail, Github, Linkedin, Instagram, Code2,
    Save, Pencil, Camera, X, Trophy, Link,
} from "lucide-react";

interface Profile {
    name: string;
    bio: string;
    email: string;
    codeforcesId: string;
    leetcodeId: string;
    githubId: string;
    linkedin: string;
    instagram: string;
    photo: string; // base64
}

const DEFAULT: Profile = {
    name: "", bio: "", email: "", codeforcesId: "",
    leetcodeId: "", githubId: "", linkedin: "", instagram: "", photo: "",
};

const STORAGE_KEY = "coding_dashboard_profile";

function InputField({ label, icon: Icon, value, onChange, placeholder, type = "text" }: {
    label: string; icon: React.ElementType; value: string;
    onChange: (v: string) => void; placeholder: string; type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
            <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile>(DEFAULT);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Profile>(DEFAULT);
    const [mounted, setMounted] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const p = JSON.parse(raw); setProfile(p); setDraft(p); } }
        catch { }
        setMounted(true);
    }, []);

    const saveProfile = () => {
        setProfile(draft);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const cancelEdit = () => { setDraft(profile); setEditing(false); };

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setDraft(d => ({ ...d, photo: ev.target?.result as string }));
        reader.readAsDataURL(file);
    };

    const set = (key: keyof Profile) => (val: string) => setDraft(d => ({ ...d, [key]: val }));

    const isEmpty = !profile.name && !profile.email;

    if (!mounted) return null;

    return (
        <div className="min-h-[calc(100vh-56px-180px)] p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <User className="text-orange-500" size={26} /> Your Profile
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stored locally in your browser</p>
                    </div>
                    {!editing && !isEmpty && (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            <Pencil size={13} /> Edit
                        </button>
                    )}
                </div>

                {/* Empty/first-time prompt */}
                {isEmpty && !editing && (
                    <div className="flex flex-col items-center py-24 gap-4 text-gray-400 dark:text-gray-600">
                        <User size={56} strokeWidth={1} />
                        <p className="text-base font-medium">No profile yet</p>
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition shadow">
                            <Pencil size={14} /> Set Up Profile
                        </button>
                    </div>
                )}

                {/* View mode */}
                {!isEmpty && !editing && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Header banner */}
                        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        <div className="px-6 pb-6">
                            {/* Avatar */}
                            <div className="-mt-10 mb-4">
                                {profile.photo ? (
                                    <img src={profile.photo} alt={profile.name} className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-lg" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                                        <User size={32} className="text-white" />
                                    </div>
                                )}
                            </div>

                            {profile.name && <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>}
                            {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{profile.bio}</p>}

                            {/* Social links */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                {profile.email && <SocialBadge icon={Mail} label={profile.email} href={`mailto:${profile.email}`} color="text-gray-600" />}
                                {profile.codeforcesId && <SocialBadge icon={Code2} label={profile.codeforcesId} href={`https://codeforces.com/profile/${profile.codeforcesId}`} color="text-blue-600" />}
                                {profile.leetcodeId && <SocialBadge icon={Trophy} label={profile.leetcodeId} href={`https://leetcode.com/u/${profile.leetcodeId}`} color="text-yellow-600" />}
                                {profile.githubId && <SocialBadge icon={Github} label={profile.githubId} href={`https://github.com/${profile.githubId}`} color="text-gray-800 dark:text-gray-200" />}
                                {profile.linkedin && <SocialBadge icon={Linkedin} label="LinkedIn" href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} color="text-blue-700" />}
                                {profile.instagram && <SocialBadge icon={Instagram} label="Instagram" href={`https://instagram.com/${profile.instagram.replace("@", "")}`} color="text-pink-600" />}
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit mode */}
                {editing && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        {/* Photo upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-full shrink-0">
                                {draft.photo ? (
                                    <img src={draft.photo} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-300" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                        <User size={28} className="text-white" />
                                    </div>
                                )}
                                <button onClick={() => fileRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow transition">
                                    <Camera size={12} className="text-white" />
                                </button>
                                {draft.photo && (
                                    <button onClick={() => setDraft(d => ({ ...d, photo: "" }))}
                                        className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow">
                                        <X size={10} className="text-white" />
                                    </button>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                                <input value={draft.name} onChange={e => set("name")(e.target.value)} placeholder="Your name"
                                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bio</label>
                            <textarea value={draft.bio} onChange={e => set("bio")(e.target.value)} placeholder="Short bio…" rows={3}
                                className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Email" icon={Mail} value={draft.email} onChange={set("email")} placeholder="you@email.com" type="email" />
                            <InputField label="Codeforces ID" icon={Code2} value={draft.codeforcesId} onChange={set("codeforcesId")} placeholder="your-handle" />
                            <InputField label="LeetCode ID" icon={Trophy} value={draft.leetcodeId} onChange={set("leetcodeId")} placeholder="your-username" />
                            <InputField label="GitHub ID" icon={Github} value={draft.githubId} onChange={set("githubId")} placeholder="github-username" />
                            <InputField label="LinkedIn" icon={Linkedin} value={draft.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..." />
                            <InputField label="Instagram" icon={Instagram} value={draft.instagram} onChange={set("instagram")} placeholder="@username" />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={cancelEdit}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                Cancel
                            </button>
                            <button onClick={saveProfile}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow">
                                <Save size={14} /> Save Profile
                            </button>
                        </div>
                    </div>
                )}

                {saved && (
                    <p className="mt-3 text-center text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                        ✓ Profile saved successfully!
                    </p>
                )}
            </div>
        </div>
    );
}

function SocialBadge({ icon: Icon, label, href, color }: { icon: React.ElementType; label: string; href: string; color: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${color}`}>
            <Icon size={12} /> {label}
        </a>
    );
}
