"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { VideoScript, ContentIdea } from "@/lib/api";
import { Copy, Edit, Save, RefreshCw, ArrowRight, RotateCcw } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { toast } from "sonner";

interface EnhancedVideoScriptEditorProps {
  script: VideoScript;
  contentIdea: ContentIdea;
  transcript: string;
  onSave: (updatedScript: VideoScript) => void;
  onRefine: (script: VideoScript, instructions: string) => Promise<VideoScript>;
  onRegenerate: (contentIdea: ContentIdea, transcript: string, instructions: string) => Promise<VideoScript>;
  onContinue: () => void;
}

export default function EnhancedVideoScriptEditor({ 
  script, 
  contentIdea,
  transcript,
  onSave, 
  onRefine,
  onRegenerate,
  onContinue
}: EnhancedVideoScriptEditorProps) {
  const [editedScript, setEditedScript] = useState(script.script);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRefineOptions, setShowRefineOptions] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedScript : script.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSaveEdit = () => {
    onSave({ ...script, script: editedScript });
    setIsEditing(false);
    toast.success("Script updated successfully");
  };

  const handleRefineScript = async () => {
    if (!refineInstructions.trim()) {
      toast.error("Please provide instructions for refinement");
      return;
    }
    
    // Use a unique toast ID for better toast management
    const toastId = "refine-script-" + Date.now();
    toast.loading("Refining your script...", { id: toastId });
    setIsRefining(true);
    
    try {
      console.log("Starting script refinement process");
      console.log("Instructions:", refineInstructions);
      console.log("Script ID:", script.id);
      
      // Create a deep copy of the script to avoid reference issues
      const scriptCopy = JSON.parse(JSON.stringify(script));
      
      // Call the API to refine the script - with error handling
      let refinedScript;
      try {
        refinedScript = await onRefine(scriptCopy, refineInstructions);
      } catch (apiError) {
        console.error("API Error during refinement:", apiError);
        throw apiError;
      }
      
      if (!refinedScript || !refinedScript.script) {
        throw new Error("Received invalid or empty script from API");
      }
      
      console.log("Refinement successful, script length:", refinedScript.script.length);
      
      // Update state with the refined script
      setEditedScript(refinedScript.script);
      onSave(refinedScript);
      
      // Clean up and show success message
      setShowRefineOptions(false);
      setRefineInstructions("");
      toast.success("Script refined successfully", { id: toastId });
    } catch (error) {
      console.error("Refinement error:", error);
      toast.error("Failed to refine script: " + (error instanceof Error ? error.message : "Unknown error"), { id: toastId });
    } finally {
      setIsRefining(false);
    }
  };

  const handleRegenerateScript = async () => {
    if (!refineInstructions.trim()) {
      toast.error("Please provide instructions for regeneration");
      return;
    }
    
    // Use a unique toast ID for better toast management
    const toastId = "regenerate-script-" + Date.now();
    toast.loading("Regenerating your script...", { id: toastId });
    setIsRegenerating(true);
    
    try {
      console.log("Starting script regeneration process");
      console.log("Instructions:", refineInstructions);
      console.log("Content idea ID:", contentIdea.id);
      console.log("Transcript length:", transcript.length);
      
      // Create a deep copy of the content idea to avoid reference issues
      const ideaCopy = JSON.parse(JSON.stringify(contentIdea));
      
      // Call the API to regenerate the script - with error handling
      let newScript;
      try {
        newScript = await onRegenerate(ideaCopy, transcript, refineInstructions);
      } catch (apiError) {
        console.error("API Error during regeneration:", apiError);
        throw apiError;
      }
      
      if (!newScript || !newScript.script) {
        throw new Error("Received invalid or empty script from API");
      }
      
      console.log("Regeneration successful, script length:", newScript.script.length);
      
      // Update state with the new script
      setEditedScript(newScript.script);
      onSave(newScript);
      
      // Clean up and show success message
      setShowRefineOptions(false);
      setRefineInstructions("");
      toast.success("Script regenerated successfully", { id: toastId });
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("Failed to regenerate script: " + (error instanceof Error ? error.message : "Unknown error"), { id: toastId });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <AnimatedCard delay={0.3}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Video Script</CardTitle>
            <CardDescription>Review, edit, or refine your script before continuing</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyScript}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            {!showRefineOptions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdit();
                  } else {
                    setIsEditing(!isEditing);
                  }
                }}
              >
                {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            )}
            {!isEditing && !showRefineOptions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRefineOptions(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refine
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showRefineOptions ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Refinement Instructions
              </label>
              <Textarea
                value={refineInstructions}
                onChange={(e) => setRefineInstructions(e.target.value)}
                placeholder="Provide specific instructions for how you'd like to refine the script. For example: 'Make it more conversational', 'Add more technical details', 'Simplify the language', etc."
                className="min-h-[120px] border-2 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Refine button clicked, calling handleRefineScript');
                  handleRefineScript();
                }}
                disabled={isRefining || !refineInstructions.trim() || isRegenerating}
                // Use default styling for yellow color scheme
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefining ? 'animate-spin' : ''}`} />
                {isRefining ? "Refining..." : "Refine Current Script"}
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Regenerate button clicked, calling handleRegenerateScript');
                  handleRegenerateScript();
                }}
                disabled={isRegenerating || !refineInstructions.trim() || isRefining}
                // Use default styling for yellow color scheme
              >
                <RotateCcw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? "Regenerating..." : "Regenerate Completely"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRefineOptions(false);
                  setRefineInstructions("");
                }}
                className="hover:no-underline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            className="min-h-[400px]"
          />
        ) : (
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm min-h-[400px]">{script.script}</div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {/* Continue button removed as requested */}
      </CardFooter>
    </AnimatedCard>
  );
}
