import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface StepConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { prompt: string }) => void;
  step: 'ideas' | 'scripts' | 'linkedin';
  currentPrompt: string;
}

export default function StepConfigDialog({
  isOpen,
  onClose,
  onConfirm,
  step,
  currentPrompt
}: StepConfigDialogProps) {
  const [prompt, setPrompt] = useState(currentPrompt);

  const stepTitles = {
    ideas: "Configure Content Ideas Generation",
    scripts: "Configure Video Script Generation",
    linkedin: "Configure LinkedIn Post Generation"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Additional Instructions
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter any specific instructions for this step..."
              className="mt-1.5"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => {
              onConfirm({ prompt });
              onClose();
            }}>
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}