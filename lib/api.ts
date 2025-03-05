import {
    testApiConnection as testApiConnectionServer,
    generateContentIdeas as generateContentIdeasServer,
    generateVideoScript as generateVideoScriptServer,
    generateLinkedInPost as generateLinkedInPostServer,
} from "@/app/actions";

// Types for our API responses
export interface ContentIdea {
    id: string;
    title: string;
    description: string;
}

export interface VideoScript {
    id: string;
    ideaId: string;
    title: string;
    script: string;
}

export interface LinkedInPost {
    id: string;
    scriptId: string;
    post: string;
}

export interface ProcessingStatus {
    stage: "ideas" | "scripts" | "linkedin" | "complete";
    progress: number;
    message: string;
}

// Get API configuration from environment variables or localStorage
export function getApiConfig() {
    // Check for environment variables first
    if (typeof process !== "undefined" && process.env) {
        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;
        const preferredProvider = process.env.PREFERRED_PROVIDER || "anthropic";

        // If we have at least one API key from env vars, use it
        if (anthropicApiKey || openaiApiKey) {
            return {
                anthropicApiKey,
                openaiApiKey,
                preferredProvider,
            };
        }
    }

    // Fall back to localStorage if no environment variables
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("apiConfig");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved API config", e);
            }
        }
    }
    return {
        openaiApiKey: "",
        anthropicApiKey: "",
        preferredProvider: "anthropic",
    };
}

// Test API connectivity with a simple request
export async function testApiConnection() {
    try {
        const config = getApiConfig();
        return await testApiConnectionServer(config);
    } catch (error: any) {
        console.error("API connection test failed:", error);
        throw error;
    }
}

// Generate content ideas from transcript
export async function generateContentIdeas(
    transcript: string,
    instructions = ""
) {
    try {
        const config = getApiConfig();
        return await generateContentIdeasServer(
            config,
            transcript,
            instructions
        );
    } catch (error: any) {
        console.error("Error generating content ideas:", error);
        throw error;
    }
}

// Generate video scripts from content ideas
export async function generateVideoScript(
    idea: ContentIdea,
    transcript: string,
    instructions = ""
) {
    try {
        const config = getApiConfig();
        return await generateVideoScriptServer(
            config,
            idea,
            transcript,
            instructions
        );
    } catch (error: any) {
        console.error("Error generating video script:", error);
        throw error;
    }
}

// Generate LinkedIn post for a video script
export async function generateLinkedInPost(script: VideoScript) {
    try {
        const config = getApiConfig();
        return await generateLinkedInPostServer(config, script);
    } catch (error: any) {
        console.error("Error generating LinkedIn post:", error);
        throw error;
    }
}
