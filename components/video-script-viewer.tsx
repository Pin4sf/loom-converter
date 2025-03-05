"use client"

import { useState } from "react"
import type { VideoScript } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface VideoScriptViewerProps {
  script: VideoScript
}

interface EditableScriptProps {
  script: VideoScript;
  onSave: (updatedScript: VideoScript) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

const EditableScript: React.FC<EditableScriptProps> = ({
  script,
  onSave,
  isEditing,
  onEditToggle,
}) => {
  const [editedContent, setEditedContent] = useState(script.script);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{script.title}</CardTitle>
          <Button variant="outline" onClick={onEditToggle}>
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[300px]"
          />
        ) : (
          <div className="whitespace-pre-wrap">{script.script}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default function VideoScriptViewer({ script }: VideoScriptViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(script.script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Video Script: {script.title}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopyScript}>
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{script.script}</div>
      </CardContent>
    </Card>
  )
}

