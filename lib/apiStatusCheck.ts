/**
 * Utility to check API connection status
 */

// Check if API keys are configured
export function checkApiKeysConfigured() {
    if (typeof window === "undefined") {
        return false;
    }

    try {
        const configStr = localStorage.getItem("apiConfig");
        if (!configStr) return false;

        const config = JSON.parse(configStr);
        const provider = config.preferredProvider;

        if (provider === "anthropic" && config.anthropicApiKey?.trim()) {
            return true;
        }

        if (provider === "openai" && config.openaiApiKey?.trim()) {
            return true;
        }

        return false;
    } catch (e) {
        console.error("Error checking API configuration:", e);
        return false;
    }
}

// Format API error for display
export function formatApiError(error: any): string {
    if (!error) return "Unknown error occurred";

    // Extract message from various error formats
    const errorMessage =
        typeof error === "object"
            ? error.message || error.toString()
            : String(error);

    // Handle specific HTTP status codes
    if (
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("authentication")
    ) {
        return "Authentication failed: Your API key seems to be invalid";
    }

    if (
        errorMessage.includes("402") ||
        errorMessage.includes("payment required")
    ) {
        return "Payment required: Your account may need payment information";
    }

    if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        return "Access forbidden: You don't have permission to use this resource";
    }

    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        return "Resource not found: The requested API endpoint doesn't exist";
    }

    if (
        errorMessage.includes("429") ||
        errorMessage.includes("too many requests") ||
        errorMessage.includes("rate limit")
    ) {
        return "Rate limit exceeded: Please try again later";
    }

    if (errorMessage.includes("500") || errorMessage.includes("server error")) {
        return "Server error: The AI service is experiencing issues";
    }

    // Handle common error patterns
    if (errorMessage.includes("API key")) {
        return "API key error: Please check your API key in settings";
    }

    if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network")
    ) {
        return "Network error: Please check your internet connection";
    }

    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
        return "Error processing AI response: The AI returned an unexpected format";
    }

    if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("timed out") ||
        errorMessage.includes("abort")
    ) {
        return "Request timeout: The AI service took too long to respond";
    }

    // Return the original message if no specific formatting is needed
    return errorMessage;
}

// Check if we have internet connectivity
export function hasInternetConnection(): boolean {
    return typeof window !== "undefined" && window.navigator.onLine;
}
