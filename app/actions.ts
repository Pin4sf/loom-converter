"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { ContentIdea, VideoScript, LinkedInPost } from "@/lib/api";

// Backend API URL
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/');

// Get API configuration from HTTP-only cookies
function getApiConfigFromCookies() {
  const cookieStore = cookies();
  return {
    anthropicApiKey: cookieStore.get('anthropic-api-key')?.value || '',
    openaiApiKey: cookieStore.get('openai-api-key')?.value || '',
    preferredProvider: (cookieStore.get('preferred-provider')?.value || 'anthropic') as 'anthropic' | 'openai',
  };
}

// Test API connection with a simple request
export async function testApiConnection(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    try {
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/test-connection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("API connection test failed:", error);
        return {
            success: false,
            message: error.message || "Failed to connect to API service",
            error,
        };
    }
}

// Generate content ideas from transcript
export async function generateContentIdeas(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    transcript: string,
    instructions = ""
) {
    try {
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies for content ideas generation");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/generate-ideas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config,
                transcript,
                instructions
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error generating content ideas:", error);
        
        // Provide more detailed error messages based on error type
        if (error.message?.includes("401") || error.message?.toLowerCase().includes("unauthorized")) {
            throw new Error(
                "API authentication failed. Please check your API key and ensure it's correctly formatted."
            );
        } else if (error.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("timeout") || error.name === "AbortError") {
            throw new Error("Request timed out. The API didn't respond in time. Please try again.");
        } else if (error.message?.includes("parse") || error.message?.includes("JSON")) {
            throw new Error("Failed to parse the AI response. Please try again or adjust your instructions.");
        } else if (!config.anthropicApiKey && !config.openaiApiKey) {
            throw new Error("No API keys configured. Please add your API keys in the settings.");
        } else if (config.preferredProvider === "anthropic" && !config.anthropicApiKey) {
            throw new Error("Anthropic API key is missing but selected as preferred provider. Please add your Anthropic API key in settings.");
        } else if (config.preferredProvider === "openai" && !config.openaiApiKey) {
            throw new Error("OpenAI API key is missing but selected as preferred provider. Please add your OpenAI API key in settings.");
        }
        
        // If we can't determine a specific error, provide a general message with the original error
        throw new Error(`Error generating content: ${error.message || "Unknown error occurred"}`); 
    }
}

// Generate video scripts from content ideas
export async function generateVideoScript(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    idea: ContentIdea,
    transcript: string,
    instructions = ""
) {
    try {
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies for video script generation");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/generate-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config,
                idea,
                transcript,
                instructions
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error generating video script:", error);
        
        // More specific error messages for better user feedback
        if (error.message?.includes("401")) {
            throw new Error(
                "API authentication failed. Please check your API key and ensure it is correctly formatted."
            );
        } else if (error.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please try again in a few minutes.");
        } else if (error.message?.includes("timeout") || error.message?.includes("timed out")) {
            throw new Error("The API request timed out. This could be due to high traffic or complex instructions. Try again with simpler instructions.");
        } else if (error.message?.includes("settings") || error.message?.includes("configuration")) {
            throw new Error("API configuration issue. Please check your provider selection and API keys in settings.");
        }
        
        // Pass through the original error if none of the above matched
        throw error;
    }
}

// Refine an existing video script with new instructions
export async function refineVideoScriptServer(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    script: VideoScript,
    instructions: string
) {
    try {
        console.log("===== STARTING SCRIPT REFINEMENT =====");
        console.log("Script ID:", script.id);
        console.log("Script title:", script.title);
        console.log("Instructions length:", instructions.length);
        console.log("Using provider:", config.preferredProvider);
        
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies for script refinement");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/refine-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config,
                script,
                instructions
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error refining video script:", error);
        
        // More specific error messages for better user feedback
        if (error.message?.includes("401")) {
            throw new Error(
                "API authentication failed. Please check your API key and ensure it is correctly formatted."
            );
        } else if (error.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please try again in a few minutes.");
        } else if (error.message?.includes("timeout") || error.message?.includes("timed out")) {
            throw new Error("The API request timed out. This could be due to high traffic or complex instructions. Try again with simpler instructions.");
        } else if (error.message?.includes("settings") || error.message?.includes("configuration")) {
            throw new Error("API configuration issue. Please check your provider selection and API keys in settings.");
        }
        
        // Pass through the original error if none of the above matched
        throw error;
    }
}

// Regenerate a video script completely
export async function regenerateVideoScriptServer(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    idea: ContentIdea,
    transcript: string,
    instructions: string
) {
    try {
        console.log("===== STARTING SCRIPT REGENERATION =====");
        console.log("Content idea ID:", idea.id);
        console.log("Content idea title:", idea.title);
        console.log("Transcript length:", transcript.length);
        console.log("Instructions length:", instructions.length);
        console.log("Using provider:", config.preferredProvider);
        
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies for script regeneration");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/regenerate-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config,
                idea,
                transcript,
                instructions
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error regenerating video script:", error);
        if (error.message?.includes("401")) {
            throw new Error(
                "API authentication failed. Please check your API key."
            );
        } else if (error.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw error;
    }
}

// Generate LinkedIn post from script
export async function generateLinkedInPost(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    script: VideoScript
) {
    try {
        // Try to get config from cookies if not provided in parameters
        if ((!config.anthropicApiKey || config.anthropicApiKey.trim() === "") && 
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")) {
            const cookieConfig = getApiConfigFromCookies();
            if (cookieConfig.anthropicApiKey || cookieConfig.openaiApiKey) {
                console.log("Using API keys from HTTP-only cookies for LinkedIn post generation");
                config = {
                    ...config,
                    anthropicApiKey: cookieConfig.anthropicApiKey || config.anthropicApiKey,
                    openaiApiKey: cookieConfig.openaiApiKey || config.openaiApiKey,
                    preferredProvider: cookieConfig.preferredProvider || config.preferredProvider
                };
            }
        }
        
        // Call the backend API instead of using the AI SDK directly
        const response = await fetch(`${API_URL}/api/generate-linkedin-post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...config,
                script
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error generating LinkedIn post:", error);
        if (error.message?.includes("401")) {
            throw new Error(
                "API authentication failed. Please check your API key."
            );
        } else if (error.message?.includes("429")) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        throw error;
    }
}