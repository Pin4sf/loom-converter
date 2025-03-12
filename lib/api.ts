// lib/api.ts
import {
    testApiConnection as testApiConnectionServer,
    generateContentIdeas as generateContentIdeasServer,
    generateVideoScript as generateVideoScriptServer,
    refineVideoScriptServer,
    regenerateVideoScriptServer,
    generateLinkedInPost as generateLinkedInPostServer,
} from "@/app/actions";

import {
    testApiConnection as testApiConnectionClient,
    generateContentIdeas as generateContentIdeasClient,
    generateVideoScript as generateVideoScriptClient,
    refineVideoScript as refineVideoScriptClient,
    regenerateVideoScript as regenerateVideoScriptClient,
    generateLinkedInPost as generateLinkedInPostClient,
} from "@/lib/api-client";

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

// Check if HTTP-only cookies are available
function hasHttpOnlyCookies() {
    if (typeof window === "undefined") {
        return true; // Assume true on server-side
    }
    return document.cookie.includes('hasApiConfig=true');
}

// Get API configuration from localStorage
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
                preferredProvider: preferredProvider as "anthropic" | "openai",
            };
        }
    }
    
    // Try to get from localStorage
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("apiConfig");
        if (saved) {
            try {
                const config = JSON.parse(saved);
                // Validate the config object has the expected structure
                if (typeof config === 'object' && config !== null) {
                    return {
                        openaiApiKey: config.openaiApiKey || "",
                        anthropicApiKey: config.anthropicApiKey || "",
                        preferredProvider: config.preferredProvider || "anthropic",
                    };
                }
            } catch (e) {
                console.error("Failed to parse saved API config from localStorage", e);
                // Clear the invalid config
                localStorage.removeItem("apiConfig");
            }
        }
    }
    
    return {
        openaiApiKey: "",
        anthropicApiKey: "",
        preferredProvider: "anthropic",
    };
}

// Save API configuration to localStorage & set HTTP-only cookies
export async function saveApiConfig(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    // Save to localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem("apiConfig", JSON.stringify(config));
    }
    
    // Also set HTTP-only cookies via API route
    try {
        const response = await fetch("/api/set-credentials", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
            credentials: "include" // Important for cookies
        });
        
        if (!response.ok) {
            console.error("Failed to set HTTP-only cookies:", await response.text());
        }
    } catch (error) {
        console.error("Error setting HTTP-only cookies:", error);
    }
    
    return config;
}

// Test API connectivity with a simple request
export async function testApiConnection() {
    try {
        const config = getApiConfig();
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            return await testApiConnectionServer(config);
        } else {
            // Otherwise use client API
            return await testApiConnectionClient(config);
        }
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
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            return await generateContentIdeasServer(config, transcript, instructions);
        } else {
            // Otherwise use client API
            return await generateContentIdeasClient(config, transcript, instructions);
        }
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
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            return await generateVideoScriptServer(config, idea, transcript, instructions);
        } else {
            // Otherwise use client API
            return await generateVideoScriptClient(config, idea, transcript, instructions);
        }
    } catch (error: any) {
        console.error("Error generating video script:", error);
        throw error;
    }
}

// Refine an existing video script with new instructions
export async function refineVideoScript(
    script: VideoScript,
    instructions: string
) {
    try {
        console.log('Initiating script refinement with instructions:', instructions);
        
        // Validate inputs
        if (!script || !script.script) {
            throw new Error('Invalid script: The script object or content is missing');
        }
        
        if (!instructions || instructions.trim() === '') {
            throw new Error('Refinement instructions cannot be empty');
        }
        
        // Get API configuration
        const config = getApiConfig();
        if (!config) {
            throw new Error('API configuration is missing. Please configure your API settings');
        }
        
        console.log('Using API provider:', config.preferredProvider);
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            const result = await refineVideoScriptServer(config, script, instructions);
            console.log('Script refinement completed successfully');
            return result;
        } else {
            // Otherwise use client API
            const result = await refineVideoScriptClient(config, script, instructions);
            console.log('Script refinement completed successfully');
            return result;
        }
    } catch (error: any) {
        console.error("Error refining video script:", error);
        // Rethrow with more context if needed
        if (error.message.includes('API key')) {
            throw new Error(`API key issue: ${error.message}`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Timeout: The refinement request took too long. Please try again.`);
        } else {
            throw error;
        }
    }
}

// Regenerate a video script completely
export async function regenerateVideoScript(
    idea: ContentIdea,
    transcript: string,
    instructions: string
) {
    try {
        console.log('Initiating script regeneration with idea:', idea.title);
        
        // Validate inputs
        if (!idea || !idea.title || !idea.description) {
            throw new Error('Invalid content idea: The idea object or its properties are missing');
        }
        
        if (!transcript || transcript.trim() === '') {
            throw new Error('Transcript cannot be empty for script regeneration');
        }
        
        if (!instructions || instructions.trim() === '') {
            throw new Error('Regeneration instructions cannot be empty');
        }
        
        // Get API configuration
        const config = getApiConfig();
        if (!config) {
            throw new Error('API configuration is missing. Please configure your API settings');
        }
        
        console.log('Using API provider:', config.preferredProvider);
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            const result = await regenerateVideoScriptServer(config, idea, transcript, instructions);
            console.log('Script regeneration completed successfully');
            return result;
        } else {
            // Otherwise use client API
            const result = await regenerateVideoScriptClient(config, idea, transcript, instructions);
            console.log('Script regeneration completed successfully');
            return result;
        }
    } catch (error: any) {
        console.error("Error regenerating video script:", error);
        // Rethrow with more context if needed
        if (error.message.includes('API key')) {
            throw new Error(`API key issue: ${error.message}`);
        } else if (error.message.includes('timeout')) {
            throw new Error(`Timeout: The regeneration request took too long. Please try again.`);
        } else {
            throw error;
        }
    }
}

// Generate LinkedIn post for a video script
export async function generateLinkedInPost(script: VideoScript) {
    try {
        const config = getApiConfig();
        
        // Use server action if HTTP-only cookies are available
        if (hasHttpOnlyCookies()) {
            return await generateLinkedInPostServer(config, script);
        } else {
            // Otherwise use client API
            return await generateLinkedInPostClient(config, script);
        }
    } catch (error: any) {
        console.error("Error generating LinkedIn post:", error);
        throw error;
    }
}