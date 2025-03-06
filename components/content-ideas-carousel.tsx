"use client"

import { useState } from "react"
import type { ContentIdea } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { motion } from "framer-motion"
import { Edit, Check } from "lucide-react"

interface ContentIdeasCarouselProps {
  ideas: ContentIdea[]
  selectedIdeaId: string | null
  onSelectIdea: (id: string) => void
  onUpdateIdea: (idea: ContentIdea) => void
}

export default function ContentIdeasCarousel({ 
  ideas, 
  selectedIdeaId, 
  onSelectIdea,
  onUpdateIdea 
}: ContentIdeasCarouselProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <AnimatedCard delay={0.2}>
      <CardHeader>
        <CardTitle>Content Ideas</CardTitle>
        <CardDescription>
          Browse through ideas and select one for your video script
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          onSelect={(index) => setCurrentIndex(index)}
        >
          <CarouselContent>
            {ideas.map((idea, index) => (
              <CarouselItem key={idea.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Card className={`h-full flex flex-col ${
                    selectedIdeaId === idea.id ? "border-primary bg-primary/5" : ""
                  }`}>
                    <CardHeader className="flex-none">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Card {index + 1}</span>
                        {selectedIdeaId === idea.id && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">Selected</span>}
                      </div>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
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
                            className="w-full p-2 border rounded min-h-[100px]"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between flex-none pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (editingId === idea.id) {
                            setEditingId(null);
                          } else {
                            setEditingId(idea.id);
                          }
                        }}
                      >
                        {editingId === idea.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>
                      {selectedIdeaId !== idea.id && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onSelectIdea(idea.id)}
                        >
                          Select
                        </Button>
                      )}
                      {selectedIdeaId === idea.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectIdea("")}
                        >
                          Deselect
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <CarouselPrevious className="relative" />
            <CarouselNext className="relative" />
          </div>
        </Carousel>
      </CardContent>
    </AnimatedCard>
  )
}
