import type { ContentIdea } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ContentIdeasListProps {
  ideas: ContentIdea[]
  selectedIdeaId: string | null
  onSelectIdea: (ideaId: string) => void
}

export default function ContentIdeasList({ ideas, selectedIdeaId, onSelectIdea }: ContentIdeasListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Ideas</CardTitle>
        <CardDescription>Select an idea to view its video script</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                selectedIdeaId === idea.id ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
              onClick={() => onSelectIdea(idea.id)}
            >
              <h3 className="font-medium">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

