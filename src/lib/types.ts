// Shared types for the question/code-store tracker

export interface Question {
    id: number;
    name: string;
    leetcodeLink: string;
    gfgLink: string;
    youtubeLink: string;
    description: string;
    important: boolean;
}
