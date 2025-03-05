"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ApiConnectionTest from "./api-config-testing";

interface ApiConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: ApiConfig) => void;
    initialConfig?: ApiConfig;
}

export interface ApiConfig {
    openaiApiKey: string;
    anthropicApiKey: string;
    preferredProvider: "openai" | "anthropic";
}

export default function ApiConfigDialog({
    isOpen,
    onClose,
    onSave,
    initialConfig,
}: ApiConfigDialogProps) {
    const [config, setConfig] = useState<ApiConfig>(
        initialConfig || {
            openaiApiKey: "",
            anthropicApiKey: "",
            preferredProvider: "openai",
        }
    );

    const handleSave = () => {
        // Trim API keys to avoid whitespace issues
        const trimmedConfig = {
            ...config,
            openaiApiKey: config.openaiApiKey.trim(),
            anthropicApiKey: config.anthropicApiKey.trim(),
        };
        onSave(trimmedConfig);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>API Configuration</DialogTitle>
                    <DialogDescription>
                        Enter your API keys to enable content generation
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                        <Input
                            id="openai-api-key"
                            type="password"
                            value={config.openaiApiKey}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    openaiApiKey: e.target.value,
                                })
                            }
                            placeholder="sk-..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Used for GPT-3.5/4 models
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="anthropic-api-key">
                            Anthropic API Key
                        </Label>
                        <Input
                            id="anthropic-api-key"
                            type="password"
                            value={config.anthropicApiKey}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    anthropicApiKey: e.target.value,
                                })
                            }
                            placeholder="sk-ant-..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Used for Claude Sonnet and other Claude models
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred AI Provider</Label>
                        <RadioGroup
                            value={config.preferredProvider}
                            onValueChange={(value) =>
                                setConfig({
                                    ...config,
                                    preferredProvider: value as
                                        | "openai"
                                        | "anthropic",
                                })
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="openai" id="openai" />
                                <Label htmlFor="openai">
                                    OpenAI (GPT-3.5/4)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="anthropic"
                                    id="anthropic"
                                />
                                <Label htmlFor="anthropic">
                                    Anthropic (Claude Sonnet)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <ApiConnectionTest config={config} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Configuration</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
