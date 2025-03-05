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

interface AgentGraphProps {
  contentIdeas: ContentIdea[]
  videoScripts: VideoScript[]
  linkedInPosts: LinkedInPost[]
  selectedIdeaId: string | null
  selectedScriptId: string | null
  isProcessing: boolean
  status: ProcessingStatus
}

export default function AgentGraph({
  contentIdeas,
  videoScripts,
  linkedInPosts,
  selectedIdeaId,
  selectedScriptId,
  isProcessing,
  status,
}: AgentGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Function to reset the graph to its default layout
  const resetLayout = useCallback(() => {
    const verticalSpacing = 150;
    const centerX = 400;
    
    const newNodes: Node[] = [
      {
        id: "transcript",
        data: { label: "Transcript" },
        position: { x: centerX, y: 50 },
        className: "react-flow__node",
      },
      {
        id: "agent1",
        data: { label: "Agent 1: Ideas" },
        position: { x: centerX, y: verticalSpacing },
        className: `react-flow__node ${status.stage === "ideas" && isProcessing ? "active" : ""}`,
      },
      {
        id: "content-ideas",
        data: { label: "Content Ideas" },
        position: { x: centerX, y: verticalSpacing * 2 },
        className: `react-flow__node ${selectedIdeaId ? "active" : ""}`,
      },
      {
        id: "agent2", 
        data: { label: "Agent 2: Script" },
        position: { x: centerX, y: verticalSpacing * 3 },
        className: `react-flow__node ${status.stage === "scripts" && isProcessing ? "active" : ""}`,
      },
      {
        id: "final-script",
        data: { label: "Final Script" },
        position: { x: centerX, y: verticalSpacing * 4 },
        className: `react-flow__node ${selectedScriptId ? "active" : ""}`,
      },
      {
        id: "agent3",
        data: { label: "Agent 3: LinkedIn" },
        position: { x: centerX, y: verticalSpacing * 5 },
        className: `react-flow__node ${status.stage === "linkedin" && isProcessing ? "active" : ""}`,
      },
      {
        id: "linkedin-post",
        data: { label: "LinkedIn Post" },
        position: { x: centerX, y: verticalSpacing * 6 },
        className: "react-flow__node",
      },
    ]

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
  }, [selectedIdeaId, selectedScriptId, isProcessing, status])

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

