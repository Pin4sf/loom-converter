import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const funLoadingMessages = [
  "Summoning AI agents...",
  "Brewing creative ideas...",
  "Extracting knowledge from the transcript...",
  "Connecting neural pathways...",
  "Analyzing content patterns...",
  "Crafting engaging narratives...",
  "Distilling key insights...",
  "Polishing script drafts...",
  "Optimizing for engagement...",
  "Adding a sprinkle of creativity...",
]

export function getRandomLoadingMessage() {
  return funLoadingMessages[Math.floor(Math.random() * funLoadingMessages.length)]
}

