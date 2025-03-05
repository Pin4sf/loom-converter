"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { formatApiError } from "@/lib/apiStatusCheck";
import { testApiConnection } from "@/app/actions"; // Import from server actions

export default function ApiConnectionTest({ config }: { config: any }) {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        provider?: string;
        error?: any;
    } | null>(null);

    const runTest = async () => {
        setTesting(true);
        setResult(null);

        try {
            // Pass the config to the server action
            const testResult = await testApiConnection({
                anthropicApiKey: config.anthropicApiKey,
                openaiApiKey: config.openaiApiKey,
                preferredProvider: config.preferredProvider,
            });
            setResult(testResult);
        } catch (error: any) {
            setResult({
                success: false,
                message: formatApiError(error),
                error,
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">API Connection Test</h3>
                <Button
                    onClick={runTest}
                    disabled={testing}
                    size="sm"
                    variant="outline"
                >
                    {testing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        "Test Connection"
                    )}
                </Button>
            </div>

            {result && (
                <div
                    className={`p-3 rounded-md text-sm flex items-start gap-2 ${
                        result.success
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                    }`}
                >
                    {result.success ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                    )}
                    <div>
                        <p className="font-medium">
                            {result.success
                                ? "Connection Successful"
                                : "Connection Failed"}
                        </p>
                        <p>{result.message}</p>
                        {result.provider && (
                            <p className="text-xs mt-1">
                                Provider: {result.provider}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
