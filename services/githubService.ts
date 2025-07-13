
import type { AppFile } from '../types';

const REPO_OWNER = 'starwreckntx';
const REPO_NAME = 'caas-codex';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

interface GithubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string | null;
    type: 'file' | 'dir';
}

export async function getCodexFiles(): Promise<AppFile[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
        }
        const repoContents: GithubFile[] = await response.json();

        const mdFiles = repoContents.filter(item => item.type === 'file' && item.name.endsWith('.md') && item.download_url);

        if (mdFiles.length === 0) {
            return [];
        }

        const fileContentsPromises = mdFiles.map(async (file) => {
            if (file.download_url) {
                const contentResponse = await fetch(file.download_url);
                if (!contentResponse.ok) {
                    console.error(`Failed to download file: ${file.name}`);
                    return null;
                }
                const content = await contentResponse.text();
                return { name: file.name, content };
            }
            return null;
        });

        const appFiles = (await Promise.all(fileContentsPromises)).filter((file): file is AppFile => file !== null);
        return appFiles;

    } catch (error) {
        console.error("Error fetching codex from GitHub:", error);
        if (error instanceof Error) {
            throw new Error(`Could not load codex from GitHub. ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching the codex.");
    }
}
