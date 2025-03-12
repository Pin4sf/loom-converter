// lib/api-client.ts
import type { ContentIdea, LinkedInPost, VideoScript } from "@/lib/api";

// Set the API URL based on environment
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

console.log(`API_URL configured as: ${API_URL}`);

/**
 * Test API connection with the backend
 */
export async function testApiConnection(config: {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  preferredProvider: "anthropic" | "openai";
}) {
  try {
    console.log(`Making request to: ${API_URL}/api/test-connection`);
    const response = await fetch(`${API_URL}/api/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      // Add mode and credentials settings for CORS
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("API connection test failed:", error);
    // Return a more user-friendly error response
    return {
      success: false,
      message: error.message || "Failed to connect to API service. Check your network connection and ensure the backend is running.",
      error,
      details: {
        url: `${API_URL}/api/test-connection`,
        config: {
          ...config,
          anthropicApiKey: config.anthropicApiKey ? '***' : undefined, // Mask for logging
          openaiApiKey: config.openaiApiKey ? '***' : undefined, // Mask for logging
        }
      }
    };
  }
}

/**
 * Generate content ideas from transcript
 */
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
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error generating content ideas:", error);
    throw new Error(`Error generating content: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Generate video script from content idea
 */
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
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error generating video script:", error);
    throw new Error(`Error generating script: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Refine existing video script
 */
export async function refineVideoScript(
  config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
  },
  script: VideoScript,
  instructions: string
) {
  try {
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
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error refining video script:", error);
    throw new Error(`Error refining script: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Regenerate video script completely
 */
export async function regenerateVideoScript(
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
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error regenerating video script:", error);
    throw new Error(`Error regenerating script: ${error.message || "Unknown error occurred"}`);
  }
}

/**
 * Generate LinkedIn post from script
 */
export async function generateLinkedInPost(
  config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
  },
  script: VideoScript
) {
  try {
    const response = await fetch(`${API_URL}/api/generate-linkedin-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...config,
        script
      }),
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error generating LinkedIn post:", error);
    throw new Error(`Error generating LinkedIn post: ${error.message || "Unknown error occurred"}`);
  }
}