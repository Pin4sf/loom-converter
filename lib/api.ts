import {
    testApiConnection as testApiConnectionServer,
    generateContentIdeas as generateContentIdeasServer,
    generateVideoScript as generateVideoScriptServer,
    generateLinkedInPost as generateLinkedInPostServer,
    refineVideoScript as refineVideoScriptServer,
    regenerateVideoScript as regenerateVideoScriptServer,
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

// Get API configuration from environment variables, HTTP-only cookies, or localStorage
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
    
    // Try to get from HTTP-only cookies via client-side cookies first
    // This is the most secure option for production environments
    try {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
            // First check for HTTP-only cookies that might have been set
            // We'll use a special flag cookie to indicate if HTTP-only cookies are set
            const cookies = document.cookie.split(';');
            let hasHttpOnlyCookies = false;
            
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('hasApiConfig=true')) {
                    hasHttpOnlyCookies = true;
                    break;
                }
            }
            
            // If we have HTTP-only cookies set, we'll try to use them via the getApiConfigFromCookies function
            // This will be handled by the server actions
            if (hasHttpOnlyCookies) {
                console.log("HTTP-only cookies detected, these will be used by server actions");
            }
        }
    } catch (e) {
        console.error("Error checking for HTTP-only cookies", e);
    }
    
    // Fall back to regular cookies if available
    if (typeof document !== "undefined") {
        try {
            const cookies = document.cookie.split(';');
            let apiConfigCookie = '';
            
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('apiConfig=')) {
                    apiConfigCookie = cookie.substring('apiConfig='.length, cookie.length);
                    break;
                }
            }
            
            if (apiConfigCookie) {
                const config = JSON.parse(decodeURIComponent(apiConfigCookie));
                if (typeof config === 'object' && config !== null) {
                    console.log("Using API config from client-side cookies");
                    return {
                        openaiApiKey: config.openaiApiKey || "",
                        anthropicApiKey: config.anthropicApiKey || "",
                        preferredProvider: config.preferredProvider || "anthropic",
                    };
                }
            }
        } catch (e) {
            console.error("Failed to parse API config from cookies", e);
        }
    }

    // Finally, try localStorage
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("apiConfig");
        if (saved) {
            try {
                const config = JSON.parse(saved);
                // Validate the config object has the expected structure
                if (typeof config === 'object' && config !== null) {
                    // Also save to cookies for cross-domain persistence
                    saveApiConfigToCookies(config);
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

// Save API configuration to both localStorage and cookies
export function saveApiConfig(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    // Save to localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem("apiConfig", JSON.stringify(config));
    }
    
    // Also save to cookies for better cross-domain persistence
    saveApiConfigToCookies(config);
    
    // Additionally, save to HTTP-only cookies via API route for better security in production
    saveApiConfigToCookie(config);
    
    return config;
}

// Save API configuration to HTTP-only cookies via API route
export async function saveApiConfigToCookie(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    try {
        // Determine the correct API endpoint URL
        // This handles both localhost and the browser preview proxy URL
        let apiUrl = '/api/set-credentials';
        
        // If we're in a browser preview environment, we need to use the absolute URL
        // to avoid CORS issues with the different origins
        if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
            // We're in a browser preview, so use the absolute URL with the original server
            const port = 3000; // Default Next.js port
            apiUrl = `http://localhost:${port}/api/set-credentials`;
        }
        
        // Set cookies with HTTP-only flag through the API route
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
            // Important for cross-origin requests with cookies
            credentials: 'include',
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API response error:', errorData);
            throw new Error(`Failed to save API configuration to HTTP-only cookies: ${response.status}`);
        }
        
        // Set a regular cookie flag to indicate that HTTP-only cookies are available
        // This helps the client-side code know that HTTP-only cookies exist
        if (typeof document !== "undefined") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry to match the HTTP-only cookies
            document.cookie = `hasApiConfig=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        }
        
        console.log('API configuration saved to HTTP-only cookies successfully');
        return true;
    } catch (error) {
        console.error('Error saving API configuration to HTTP-only cookies:', error);
        return false;
    }
}

// Helper function to save API config to cookies
function saveApiConfigToCookies(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    if (typeof document !== "undefined") {
        // Set cookie to expire in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        // Set the cookie with path=/ to make it available across the site
        // Note: We're not using HttpOnly as it would make the cookie inaccessible to JavaScript
        document.cookie = `apiConfig=${encodeURIComponent(JSON.stringify(config))};expires=${expiryDate.toUTCString()};path=/;SameSite=Strict`;
    }
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
