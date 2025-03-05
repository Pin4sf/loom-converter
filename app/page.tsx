"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  type ContentIdea,
  type LinkedInPost,
  type ProcessingStatus,
  type VideoScript,
  generateContentIdeas,
  generateLinkedInPost,
  generateVideoScript,
} from "@/lib/api"
import { getRandomLoadingMessage } from "@/lib/utils"
import AgentGraph from "@/components/agent-graph"
import ContentIdeasList from "@/components/content-ideas-list"
import VideoScriptViewer from "@/components/video-script-viewer"
import LinkedInPostViewer from "@/components/linkedin-post-viewer"
import StepConfigDialog from "@/components/step-config-dialog"
import { Cog, Pause, Play } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import ApiConfigDialog, { type ApiConfig } from "@/components/api-config-dialog"
import VideoScriptEditor from "@/components/video-script-editor"

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus>({ stage: "ideas", progress: 0, message: "" })
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [videoScripts, setVideoScripts] = useState<VideoScript[]>([])
  const [linkedInPosts, setLinkedInPosts] = useState<LinkedInPost[]>([])
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false)
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    // Try to load from localStorage on initial render
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apiConfig")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse saved API config", e)
        }
      }
    }
    return {
      openaiApiKey: "",
      anthropicApiKey: "",
      preferredProvider: "anthropic" as const,
    }
  })
  const [isApiConfigured, setIsApiConfigured] = useState(false)
  const [generationMode, setGenerationMode] = useState<'all' | 'step'>('all');
  const [currentStep, setCurrentStep] = useState<'idle' | 'ideas' | 'scripts' | 'linkedin'>('idle');
  const [stepPrompts, setStepPrompts] = useState({
    ideas: '',
    scripts: '',
    linkedin: ''
  });
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    ideas: false,
    scripts: false,
    linkedin: false
  });
  const [stepInputs, setStepInputs] = useState({
    ideas: {
      prompt: '',
      result: null
    },
    scripts: {
      prompt: '',
      selectedIdeaId: null,
      result: null
    },
    linkedin: {
      prompt: '',
      selectedScriptId: null,
      result: null
    }
  });
  const [stepConfigOpen, setStepConfigOpen] = useState(false);

  const selectedIdea = contentIdeas.find((idea) => idea.id === selectedIdeaId)
  const selectedScript = videoScripts.find((script) => script.id === selectedScriptId)
  const selectedLinkedInPost = linkedInPosts.find((post) => post.scriptId === selectedScriptId)

  // Check if API is configured on initial load and when config changes
  useEffect(() => {
    const hasAnthropicKey = apiConfig.anthropicApiKey && apiConfig.anthropicApiKey.startsWith("sk-ant")
    const hasOpenAIKey = apiConfig.openaiApiKey && apiConfig.openaiApiKey.startsWith("sk-")

    // Set as configured if the selected provider has a valid key
    if (apiConfig.preferredProvider === "anthropic" && hasAnthropicKey) {
      setIsApiConfigured(true)
    } else if (apiConfig.preferredProvider === "openai" && hasOpenAIKey) {
      setIsApiConfigured(true)
    } else {
      setIsApiConfigured(false)
    }

    // Show config dialog on first load if not configured
    if (!hasAnthropicKey && !hasOpenAIKey && !isApiConfigOpen) {
      setIsApiConfigOpen(true)
    }
  }, [apiConfig, isApiConfigOpen])

  const updateLoadingMessage = () => {
    setLoadingMessage(getRandomLoadingMessage())
  }

  const updateStatus = (stage: ProcessingStatus["stage"], progress: number) => {
    setStatus({
      stage,
      progress,
      message: `Processing ${stage}...`,
    })
    updateLoadingMessage()
  }

  const handleSaveApiConfig = (config: ApiConfig) => {
    setApiConfig(config)
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("apiConfig", JSON.stringify(config))
    }
  }

  const handleGenerateContent = async () => {
    if (!transcript.trim() || !isApiConfigured) return

    try {
      setIsProcessing(true)
      setIsPaused(false)
      setContentIdeas([])
      setVideoScripts([])
      setLinkedInPosts([])
      setSelectedIdeaId(null)
      setSelectedScriptId(null)
      updateLoadingMessage()

      // Step 1: Generate content ideas
      updateStatus("ideas", 10)
      const ideas = await generateContentIdeas(transcript, instructions)
      setContentIdeas(ideas)
      if (ideas.length > 0) {
        setSelectedIdeaId(ideas[0].id)
      }

      updateStatus("scripts", 40)

      // Step 2: Generate video scripts for each idea
      const scripts: VideoScript[] = []
      for (let i = 0; i < ideas.length; i++) {
        if (isPaused) {
          break
        }

        const idea = ideas[i]
        const script = await generateVideoScript(idea, transcript, instructions)
        scripts.push(script)
        setVideoScripts([...scripts])

        updateStatus("scripts", 40 + (i + 1) * (30 / ideas.length))
        updateLoadingMessage()
      }

      if (scripts.length > 0 && !isPaused) {
        setSelectedScriptId(scripts[0].id)

        // Step 3: Generate LinkedIn post for the first script
        updateStatus("linkedin", 80)
        const post = await generateLinkedInPost(scripts[0])
        setLinkedInPosts([post])

        updateStatus("complete", 100)
      }
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  const handleSelectIdea = async (ideaId: string) => {
    setSelectedIdeaId(ideaId)

    // Find if we already have a script for this idea
    const existingScript = videoScripts.find((script) => script.ideaId === ideaId)
    if (existingScript) {
      setSelectedScriptId(existingScript.id)

      // Find if we already have a LinkedIn post for this script
      const existingPost = linkedInPosts.find((post) => post.scriptId === existingScript.id)
      if (!existingPost && !isProcessing) {
        try {
          setIsProcessing(true)
          updateStatus("linkedin", 80)
          const post = await generateLinkedInPost(existingScript)
          setLinkedInPosts([...linkedInPosts, post])
          updateStatus("complete", 100)
        } catch (error) {
          console.error("Error generating LinkedIn post:", error)
        } finally {
          setIsProcessing(false)
        }
      }
    }
  }

  const handleUpdateIdea = (updatedIdea: ContentIdea) => {
    setContentIdeas(ideas => 
      ideas.map(idea => 
        idea.id === updatedIdea.id ? updatedIdea : idea
      )
    );
  };

  const handleUpdateScript = (updatedScript: VideoScript) => {
    setVideoScripts(scripts => 
      scripts.map(script => 
        script.id === updatedScript.id ? updatedScript : script
      )
    );
  };

  const GenerateButtons = () => (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          setGenerationMode('all');
          handleGenerateContent();
        }}
        disabled={!transcript.trim() || !isApiConfigured || (isProcessing && !isPaused)}
      >
        Run All
      </Button>
      <Button
        onClick={() => {
          setGenerationMode('step');
          handleNextStep();
        }}
        disabled={!transcript.trim() || !isApiConfigured || (isProcessing && !isPaused)}
        variant="outline"
      >
        Run Next Step
      </Button>
    </div>
  );

  const handleNextStep = async () => {
    if (!transcript.trim() || !isApiConfigured) return;

    try {
      switch (currentStep) {
        case 'idle':
          setCurrentStep('ideas');
          setStepConfigOpen(true);
          break;

        case 'ideas':
          setIsProcessing(true);
          updateStatus("ideas", 10);
          const ideas = await generateContentIdeas(transcript, stepInputs.ideas.prompt || instructions);
          setContentIdeas(ideas);
          if (ideas.length > 0) {
            setSelectedIdeaId(ideas[0].id);
          }
          setStepInputs(prev => ({
            ...prev,
            ideas: { ...prev.ideas, result: ideas }
          }));
          setCompletedSteps(prev => ({ ...prev, ideas: true }));
          setCurrentStep('scripts');
          updateStatus("ideas", 100);
          setIsProcessing(false);
          break;

        case 'scripts':
          if (!selectedIdeaId) {
            toast.error("Please select and finalize a content idea first");
            return;
          }
          setIsProcessing(true);
          updateStatus("scripts", 10);
          const selectedIdea = contentIdeas.find(i => i.id === selectedIdeaId);
          if (!selectedIdea) return;
          
          const generatedScript = await generateVideoScript(
            selectedIdea, 
            transcript, 
            `Use this content idea as basis: ${selectedIdea.title}\n${selectedIdea.description}\n\n${stepInputs.scripts.prompt || instructions}`
          );
          setVideoScripts([...videoScripts, generatedScript]);
          setStepInputs(prev => ({
            ...prev,
            scripts: { 
              ...prev.scripts, 
              result: generatedScript,
              selectedIdeaId
            }
          }));
          setSelectedScriptId(generatedScript.id);
          setCompletedSteps(prev => ({ ...prev, scripts: true }));
          setCurrentStep('linkedin');
          updateStatus("scripts", 100);
          setIsProcessing(false);
          break;

        case 'linkedin':
          if (!selectedScriptId) {
            toast.error("Please select and finalize a video script first");
            return;
          }
          setIsProcessing(true);
          updateStatus("linkedin", 10);
          const selectedScript = videoScripts.find(s => s.id === selectedScriptId);
          if (!selectedScript) return;

          const post = await generateLinkedInPost(
            selectedScript,
            stepInputs.linkedin.prompt || instructions
          );
          setLinkedInPosts([...linkedInPosts, post]);
          setStepInputs(prev => ({
            ...prev,
            linkedin: { 
              ...prev.linkedin, 
              result: post,
              selectedScriptId 
            }
          }));
          setCompletedSteps(prev => ({ ...prev, linkedin: true }));
          setCurrentStep('idle');
          updateStatus("complete", 100);
          setIsProcessing(false);
          break;
      }
    } catch (error) {
      console.error("Error in step execution:", error);
      toast.error("Error executing step");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container relative z-10 py-8 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Contentformer</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setIsApiConfigOpen(true)}>
              <Cog className="mr-2 h-4 w-4" />
              Configure API Keys
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="direct-transcript">
              <TabsList className="w-full">
                <TabsTrigger value="video-upload" className="flex-1">
                  Video Upload
                </TabsTrigger>
                <TabsTrigger value="direct-transcript" className="flex-1">
                  Direct Transcript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="video-upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Upload</CardTitle>
                    <CardDescription>Upload a video to extract the transcript.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                      <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="direct-transcript">
                <Card>
                  <CardHeader>
                    <CardTitle>Direct Transcript Input</CardTitle>
                    <CardDescription>
                      Already have a transcript? Paste it here to generate content directly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste your transcript here..."
                      className="min-h-[200px]"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      disabled={isProcessing}
                    />
                    <Textarea
                      placeholder="Additional instructions (optional)"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      disabled={isProcessing}
                    />
                    <div className="flex justify-end gap-2">
                      {isProcessing && (
                        <Button variant="outline" onClick={handlePauseResume}>
                          {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                          {isPaused ? "Resume" : "Pause"}
                        </Button>
                      )}
                      <GenerateButtons />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {!isApiConfigured && (
              <Card className="mt-4 border-yellow-500 bg-yellow-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-center text-yellow-700">
                    Please configure your API keys before generating content.
                    <Button
                      variant="link"
                      className="text-yellow-700 underline p-0 h-auto ml-1"
                      onClick={() => setIsApiConfigOpen(true)}
                    >
                      Configure now
                    </Button>
                  </p>
                </CardContent>
              </Card>
            )}

            {isProcessing && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-center">{loadingMessage}</p>
                    <Progress value={status.progress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">{status.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {contentIdeas.length > 0 && (
              <div className="mt-8 space-y-8">
                <ContentIdeasList
                  ideas={contentIdeas}
                  selectedIdeaId={selectedIdeaId}
                  onSelectIdea={handleSelectIdea}
                  onUpdateIdea={handleUpdateIdea}
                />

                {selectedScript && (
                  <VideoScriptEditor
                    script={selectedScript}
                    onSave={handleUpdateScript}
                  />
                )}

                {selectedLinkedInPost && <LinkedInPostViewer post={selectedLinkedInPost} />}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Agent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentGraph
                  contentIdeas={contentIdeas}
                  videoScripts={videoScripts}
                  linkedInPosts={linkedInPosts}
                  selectedIdeaId={selectedIdeaId}
                  selectedScriptId={selectedScriptId}
                  isProcessing={isProcessing}
                  status={status}
                  completedSteps={completedSteps}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApiConfigDialog
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        onSave={handleSaveApiConfig}
        initialConfig={apiConfig}
      />
    </div>
  )
}

