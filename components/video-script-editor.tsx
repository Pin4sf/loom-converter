import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { VideoScript } from "@/lib/api";
import { Copy, Edit, Save } from "lucide-react";

interface VideoScriptEditorProps {
  script: VideoScript;
  onSave: (updatedScript: VideoScript) => void;
}

export default function VideoScriptEditor({ script, onSave }: VideoScriptEditorProps) {
  const [editedScript, setEditedScript] = useState(script.script);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedScript : script.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Video Script</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyScript}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  onSave({ ...script, script: editedScript });
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            className="min-h-[300px]"
          />
        ) : (
          <div className="whitespace-pre-wrap">{script.script}</div>
        )}
      </CardContent>
    </Card>
  );
} 