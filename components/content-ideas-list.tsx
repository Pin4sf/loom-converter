"use client"

import type { ContentIdea } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AnimatedCard } from "@/components/ui/animated-card"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ContentIdeasListProps {
  ideas: ContentIdea[]
  selectedIdeaId: string | null
  onSelectIdea: (id: string) => void
  onUpdateIdea: (idea: ContentIdea) => void
}

export default function ContentIdeasList({ 
  ideas, 
  selectedIdeaId, 
  onSelectIdea,
  onUpdateIdea 
}: ContentIdeasListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <AnimatedCard delay={0.2}>
      <CardHeader>
        <CardTitle>Content Ideas</CardTitle>
        <CardDescription>
          Select and optionally edit an idea before generating its video script
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className={`p-4 border rounded-md ${
                selectedIdeaId === idea.id ? "border-primary bg-primary/5" : ""
              }`}
            >
              {editingId === idea.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={idea.title}
                    onChange={(e) => onUpdateIdea({
                      ...idea,
                      title: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    value={idea.description}
                    onChange={(e) => onUpdateIdea({
                      ...idea,
                      description: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="cursor-pointer"
                  onClick={() => onSelectIdea(idea.id)}
                >
                  <h3 className="font-medium">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {idea.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(idea.id);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

