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
                preferredProvider: preferredProvider as "anthropic" | "openai",
            };
        }
    }

    // Fall back to localStorage if no environment variables
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
                console.error("Failed to parse saved API config", e);
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
        
        // Call server function
        const result = await refineVideoScriptServer(
            config,
            script,
            instructions
        );
        
        console.log('Script refinement completed successfully');
        return result;
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
        
        // Call server function
        const result = await regenerateVideoScriptServer(
            config,
            idea,
            transcript,
            instructions
        );
        
        console.log('Script regeneration completed successfully');
        return result;
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
        return await generateLinkedInPostServer(config, script);
    } catch (error: any) {
        console.error("Error generating LinkedIn post:", error);
        throw error;
    }
}
