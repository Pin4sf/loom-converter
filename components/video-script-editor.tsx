import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { VideoScript } from "@/lib/api";

interface VideoScriptEditorProps {
  script: VideoScript;
  onSave: (updatedScript: VideoScript) => void;
}

export default function VideoScriptEditor({ script, onSave }: VideoScriptEditorProps) {
  const [editedScript, setEditedScript] = useState(script.script);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Video Script</span>
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
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </CardTitle>
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