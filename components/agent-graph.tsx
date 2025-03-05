"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges,
  ReactFlowProvider,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import type { ContentIdea, LinkedInPost, ProcessingStatus, VideoScript } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Add new types for node states
type NodeState = 'idle' | 'processing' | 'complete' | 'error';

// Add new prop for completion status with default value
interface AgentGraphProps {
  contentIdeas: ContentIdea[];
  videoScripts: VideoScript[];
  linkedInPosts: LinkedInPost[];
  selectedIdeaId: string | null;
  selectedScriptId: string | null;
  isProcessing: boolean;
  status: {
    stage: string;
    progress: number;
  };
  completedSteps?: {
    ideas: boolean;
    scripts: boolean;
    linkedin: boolean;
  };
}

export default function AgentGraph({
  contentIdeas,
  videoScripts,
  linkedInPosts,
  selectedIdeaId,
  selectedScriptId,
  isProcessing,
  status,
  completedSteps = {
    ideas: false,
    scripts: false,
    linkedin: false
  }
}: AgentGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Modify getNodeStyle to handle processing state
  const getNodeStyle = (nodeId: string, state: NodeState) => {
    const baseStyle = "rounded-lg border shadow-lg p-4";
    
    if (isProcessing && status.stage === nodeId.split("-")[0]) {
      return `${baseStyle} animate-pulse bg-yellow-500/20`;
    }
    
    switch (state) {
      case 'processing':
        return `${baseStyle} animate-pulse bg-yellow-500/20`;
      case 'complete':
        return `${baseStyle} bg-green-500/20 border-green-500`;
      case 'error':
        return `${baseStyle} bg-red-500/20 border-red-500`;
      default:
        return `${baseStyle} bg-background`;
    }
  };

  const resetLayout = useCallback(() => {
    const verticalSpacing = 150;
    const centerX = 250;

    const newNodes: Node[] = [
      {
        id: "transcript",
        data: { label: "Transcript" },
        position: { x: centerX, y: 50 },
        className: getNodeStyle("transcript", 
          status.stage === "complete" ? "complete" : "idle"),
      },
      {
        id: "agent1",
        data: { label: "Agent 1: Ideas" },
        position: { x: centerX, y: verticalSpacing },
        className: getNodeStyle("agent1", 
          completedSteps.ideas ? "complete" : 
          status.stage === "ideas" ? "processing" : "idle"),
      },
      {
        id: "content-ideas",
        data: { 
          label: `Content Ideas (${contentIdeas.length})`,
          ideas: contentIdeas 
        },
        position: { x: centerX, y: verticalSpacing * 2 },
        className: getNodeStyle("content-ideas", 
          completedSteps.ideas ? "complete" : "idle"),
      },
      {
        id: "agent2",
        data: { label: "Agent 2: Scripts" },
        position: { x: centerX, y: verticalSpacing * 3 },
        className: getNodeStyle("agent2", 
          completedSteps.scripts ? "complete" : 
          status.stage === "scripts" ? "processing" : "idle"),
      },
      {
        id: "final-script",
        data: { 
          label: `Video Scripts (${videoScripts.length})`,
          scripts: videoScripts 
        },
        position: { x: centerX, y: verticalSpacing * 4 },
        className: getNodeStyle("final-script", 
          completedSteps.scripts ? "complete" : "idle"),
      },
      {
        id: "agent3",
        data: { label: "Agent 3: LinkedIn" },
        position: { x: centerX, y: verticalSpacing * 5 },
        className: getNodeStyle("agent3", 
          completedSteps.linkedin ? "complete" : 
          status.stage === "linkedin" ? "processing" : "idle"),
      },
      {
        id: "linkedin-post",
        data: { 
          label: `LinkedIn Posts (${linkedInPosts.length})`,
          posts: linkedInPosts 
        },
        position: { x: centerX, y: verticalSpacing * 6 },
        className: getNodeStyle("linkedin-post", 
          completedSteps.linkedin ? "complete" : "idle"),
      },
    ];

    // Update edges for vertical layout
    const newEdges: Edge[] = [
      {
        id: "transcript-agent1",
        source: "transcript",
        target: "agent1",
        animated: status.stage === "ideas" && isProcessing,
        type: "smoothstep",
      },
      {
        id: "agent1-ideas",
        source: "agent1",
        target: "content-ideas",
        animated: status.stage === "ideas" && isProcessing,
        type: "smoothstep",
      },
      {
        id: "ideas-agent2",
        source: "content-ideas",
        target: "agent2",
        animated: status.stage === "scripts" && isProcessing,
        type: "smoothstep",
      },
      {
        id: "agent2-script",
        source: "agent2",
        target: "final-script",
        animated: status.stage === "scripts" && isProcessing,
        type: "smoothstep",
      },
      {
        id: "script-agent3",
        source: "final-script",
        target: "agent3",
        animated: status.stage === "linkedin" && isProcessing,
        type: "smoothstep",
      },
      {
        id: "agent3-linkedin",
        source: "agent3",
        target: "linkedin-post",
        animated: status.stage === "linkedin" && isProcessing,
        type: "smoothstep",
      },
    ]

    setNodes(newNodes)
    setEdges(newEdges)
  }, [selectedIdeaId, selectedScriptId, isProcessing, status, completedSteps, contentIdeas, videoScripts, linkedInPosts])

  // Initialize the graph
  useEffect(() => {
    resetLayout()
  }, [resetLayout])

  // Handle node changes (position updates)
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

  return (
    <ReactFlowProvider>
      <div style={{ height: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-right">
            <Button variant="outline" size="sm" onClick={resetLayout} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Reset Layout
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}

