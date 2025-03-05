export const mockContentIdeas = [
  {
    id: "idea1",
    title: "The Future of AI in Content Creation",
    description: "Exploring how artificial intelligence is revolutionizing the way we create and distribute content."
  },
  {
    id: "idea2",
    title: "5 Essential Productivity Hacks",
    description: "Proven strategies to boost your daily productivity and achieve more in less time."
  },
  {
    id: "idea3",
    title: "Building a Personal Brand Online",
    description: "Step-by-step guide to establishing and growing your presence on social media."
  }
]

export const mockVideoScripts = [
  {
    id: "script1",
    ideaId: "idea1",
    sections: [
      {
        id: "section1",
        title: "Introduction",
        content: "Welcome to this exciting exploration of AI in content creation..."
      },
      {
        id: "section2",
        title: "Current Trends",
        content: "Let's look at the major trends shaping the industry..."
      },
      {
        id: "section3",
        title: "Conclusion",
        content: "The future of content creation is bright with AI..."
      }
    ]
  }
]

export const mockLinkedInPosts = [
  {
    id: "post1",
    scriptId: "script1",
    content: "🚀 Excited to share my latest insights on AI in content creation!\n\nIn this video, we explore how artificial intelligence is transforming the way we create and distribute content...",
    hashtags: ["#AI", "#ContentCreation", "#DigitalMarketing"]
  }
]

// Mock processing status
export const mockProcessingStatus = {
  stage: "ideas", // or "scripts" or "linkedin"
  progress: 66,
  message: "Generating creative content ideas..."
}

// Helper function to get random delay within range
export const getRandomDelay = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const mockApiDelays = {
  contentIdeas: {
    min: 2000,
    max: 4000
  },
  videoScript: {
    min: 3000,
    max: 6000
  },
  linkedInPost: {
    min: 1500,
    max: 3000
  },
  apiTest: {
    min: 800,
    max: 1500
  }
} 