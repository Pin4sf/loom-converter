"use client"

import type { ContentIdea } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AnimatedCard } from "@/components/ui/animated-card"

interface ContentIdeasListProps {
  ideas: ContentIdea[]
  selectedIdeaId: string | null
  onSelectIdea: (ideaId: string) => void
}

export default function ContentIdeasList({ ideas, selectedIdeaId, onSelectIdea }: ContentIdeasListProps) {
  return (
    <AnimatedCard delay={0.2}>
      <CardHeader>
        <CardTitle>Content Ideas</CardTitle>
        <CardDescription>Select an idea to view its video script</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className={`p-4 border rounded-md cursor-pointer transition-all hover:scale-[1.02] ${
                selectedIdeaId === idea.id ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
              onClick={() => onSelectIdea(idea.id)}
            >
              <h3 className="font-medium">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  )
}

