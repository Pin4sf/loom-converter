"use server";

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { v4 as uuidv4 } from "uuid";
import { ContentIdea, VideoScript, LinkedInPost } from "@/lib/api";

// Test API connection with a simple request
export async function testApiConnection(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    preferredProvider: "anthropic" | "openai";
}) {
    try {
        // Validate API configuration
        const provider = config.preferredProvider;

        if (
            provider === "anthropic" &&
            (!config.anthropicApiKey || config.anthropicApiKey.trim() === "")
        ) {
            throw new Error(
                "Anthropic API key is missing. Please add your API key in settings."
            );
        }

        if (
            provider === "openai" &&
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")
        ) {
            throw new Error(
                "OpenAI API key is missing. Please add your API key in settings."
            );
        }

        const prompt =
            "Return the text 'API connection successful' as a response.";
        const timeout = 10000; // 10 second timeout for test

        if (provider === "anthropic" && config.anthropicApiKey) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await generateText({
                    model: anthropic("claude-3-5-sonnet-20241022", {
                        apiKey: config.anthropicApiKey,
                    }),
                    prompt,
                    temperature: 0.1,
                    maxTokens: 20,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                return {
                    success: true,
                    provider: "anthropic",
                    message: "Anthropic API connection successful",
                };
            } catch (error: any) {
                clearTimeout(timeoutId);
                if (
                    error.status === 401 ||
                    error.message?.includes("401") ||
                    error.message?.includes("unauthorized")
                ) {
                    throw new Error(
                        "Invalid Anthropic API key. Please check your API key and try again."
                    );
                }
                throw error;
            }
        } else if (provider === "openai" && config.openaiApiKey) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await generateText({
                    model: openai("gpt-4", { apiKey: config.openaiApiKey }),
                    prompt,
                    temperature: 0.1,
                    maxTokens: 20,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                return {
                    success: true,
                    provider: "openai",
                    message: "OpenAI API connection successful",
                };
            } catch (error: any) {
                clearTimeout(timeoutId);
                if (
                    error.status === 401 ||
                    error.message?.includes("401") ||
                    error.message?.includes("unauthorized")
                ) {
                    throw new Error(
                        "Invalid OpenAI API key. Please check your API key and try again."
                    );
                }
                throw error;
            }
        } else {
            throw new Error(
                "No valid API configuration found. Please check your API settings."
            );
        }
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
        // Validate API configuration
        const provider = config.preferredProvider;

        if (
            provider === "anthropic" &&
            (!config.anthropicApiKey || config.anthropicApiKey.trim() === "")
        ) {
            throw new Error(
                "Anthropic API key is missing. Please add your API key in settings."
            );
        }

        if (
            provider === "openai" &&
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")
        ) {
            throw new Error(
                "OpenAI API key is missing. Please add your API key in settings."
            );
        }

        const prompt = `
You are an expert content strategist. Analyze the following transcript and generate 3-5 high-level content ideas or topics that could be turned into engaging video scripts.

For each idea, provide:
1. A catchy title
2. A brief description of what the video would cover

TRANSCRIPT:
${transcript}

${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ""}

IMPORTANT: Format your response STRICTLY as a valid JSON array of objects with 'title' and 'description' fields. Do not include any explanations, markdown formatting, or additional text outside of the JSON array.
Example format:
[
  {
    "title": "Example Title 1",
    "description": "Example description 1"
  },
  {
    "title": "Example Title 2",
    "description": "Example description 2"
  }
]
`;

        let text = "";
        const timeout = 30000; // 30 second timeout

        try {
            if (provider === "anthropic" && config.anthropicApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: anthropic("claude-3-5-sonnet-20241022", {
                        apiKey: config.anthropicApiKey,
                    }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 1000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else if (provider === "openai" && config.openaiApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: openai("gpt-4", { apiKey: config.openaiApiKey }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 1000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else {
                throw new Error(
                    "No valid API configuration found. Please check your API settings."
                );
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                throw new Error(
                    "Request timed out. The API didn't respond in time."
                );
            }
            throw error;
        }

        // Validate and parse the response
        if (!text || text.trim() === "") {
            throw new Error("Received empty response from AI service.");
        }

        try {
            // Try to extract JSON from the response
            // First attempt to parse directly
            try {
                const parsedData = JSON.parse(text);
                if (Array.isArray(parsedData)) {
                    const ideas: ContentIdea[] = parsedData.map(
                        (idea: any, index: number) => ({
                            id: `idea-${uuidv4().slice(0, 8)}`,
                            title: idea.title || "Untitled Idea",
                            description:
                                idea.description || "No description provided",
                        })
                    );
                    return ideas;
                }
            } catch (e) {
                // Initial parsing failed, try to extract JSON from the text
                console.warn(
                    "Direct JSON parsing failed, trying to extract JSON",
                    e
                );
            }

            // Try to extract a JSON array from the text using regex
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const extractedJson = jsonMatch[0];
                    const parsedData = JSON.parse(extractedJson);

                    if (Array.isArray(parsedData)) {
                        const ideas: ContentIdea[] = parsedData.map(
                            (idea: any, index: number) => ({
                                id: `idea-${uuidv4().slice(0, 8)}`,
                                title: idea.title || "Untitled Idea",
                                description:
                                    idea.description ||
                                    "No description provided",
                            })
                        );
                        return ideas;
                    }
                } catch (e) {
                    console.warn("JSON extraction attempt failed", e);
                }
            }

            // If we still can't parse the JSON, throw an error
            console.error(
                "Error parsing AI response - no valid JSON found in:",
                text
            );
            throw new Error(
                "Failed to parse response from AI service. The response was not in the expected JSON format."
            );
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            throw new Error(
                "Failed to parse response from AI service. The response was not in the expected JSON format."
            );
        }
    } catch (error: any) {
        console.error("Error generating content ideas:", error);
        // Rethrow with a more descriptive message
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
        // Validate API configuration
        const provider = config.preferredProvider;

        if (
            provider === "anthropic" &&
            (!config.anthropicApiKey || config.anthropicApiKey.trim() === "")
        ) {
            throw new Error(
                "Anthropic API key is missing. Please add your API key in settings."
            );
        }

        if (
            provider === "openai" &&
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")
        ) {
            throw new Error(
                "OpenAI API key is missing. Please add your API key in settings."
            );
        }

        const prompt = `
You are an expert video script writer. Create a detailed, engaging video script based on the following content idea and original transcript.

CONTENT IDEA:
Title: ${idea.title}
Description: ${idea.description}

ORIGINAL TRANSCRIPT:
${transcript}

${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}` : ""}

Create a professional video script that includes:
1. An attention-grabbing introduction
2. Clear sections with headers
3. Engaging talking points
4. A strong call-to-action conclusion

Format your response as a well-structured script with clear sections. Do not include any explanations or additional text outside the script.
`;

        let text = "";
        const timeout = 60000; // 60 second timeout for longer content

        try {
            if (provider === "anthropic" && config.anthropicApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: anthropic("claude-3-5-sonnet-20241022", {
                        apiKey: config.anthropicApiKey,
                    }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 2000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else if (provider === "openai" && config.openaiApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: openai("gpt-4", { apiKey: config.openaiApiKey }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 2000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else {
                throw new Error(
                    "No valid API configuration found. Please check your API settings."
                );
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                throw new Error(
                    "Request timed out. The API didn't respond in time."
                );
            }
            throw error;
        }

        if (!text || text.trim() === "") {
            throw new Error("Received empty response from AI service.");
        }

        return {
            id: `script-${uuidv4().slice(0, 8)}`,
            ideaId: idea.id,
            title: idea.title,
            script: text,
        };
    } catch (error: any) {
        console.error("Error generating video script:", error);
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

// Generate LinkedIn post for a video script
export async function generateLinkedInPost(
    config: {
        anthropicApiKey?: string;
        openaiApiKey?: string;
        preferredProvider: "anthropic" | "openai";
    },
    script: VideoScript
) {
    try {
        // Validate API configuration
        const provider = config.preferredProvider;

        if (
            provider === "anthropic" &&
            (!config.anthropicApiKey || config.anthropicApiKey.trim() === "")
        ) {
            throw new Error(
                "Anthropic API key is missing. Please add your API key in settings."
            );
        }

        if (
            provider === "openai" &&
            (!config.openaiApiKey || config.openaiApiKey.trim() === "")
        ) {
            throw new Error(
                "OpenAI API key is missing. Please add your API key in settings."
            );
        }

        const prompt = `
You are a social media expert specializing in LinkedIn content. Create an engaging LinkedIn post to promote a video with the following script.

VIDEO TITLE: ${script.title}

VIDEO SCRIPT:
${script.script}

Create a LinkedIn post that:
1. Has an attention-grabbing first line
2. Highlights the key value points from the video
3. Includes relevant hashtags
4. Has a clear call-to-action

Format your response as a ready-to-post LinkedIn update. Do not include any explanations or additional text outside the post.
`;

        let text = "";
        const timeout = 30000; // 30 second timeout

        try {
            if (provider === "anthropic" && config.anthropicApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: anthropic("claude-3-5-sonnet-20241022", {
                        apiKey: config.anthropicApiKey,
                    }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 1000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else if (provider === "openai" && config.openaiApiKey) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await generateText({
                    model: openai("gpt-4", { apiKey: config.openaiApiKey }),
                    prompt,
                    temperature: 0.7,
                    maxTokens: 1000,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                text = response.text;
            } else {
                throw new Error(
                    "No valid API configuration found. Please check your API settings."
                );
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                throw new Error(
                    "Request timed out. The API didn't respond in time."
                );
            }
            throw error;
        }

        if (!text || text.trim() === "") {
            throw new Error("Received empty response from AI service.");
        }

        return {
            id: `linkedin-${uuidv4().slice(0, 8)}`,
            scriptId: script.id,
            post: text,
        };
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
