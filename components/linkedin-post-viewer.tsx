"use client"

import { useState } from "react"
import type { LinkedInPost } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface LinkedInPostViewerProps {
  post: LinkedInPost
}

export default function LinkedInPostViewer({ post }: LinkedInPostViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPost = async () => {
    try {
      await navigator.clipboard.writeText(post.post)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>LinkedIn Post</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopyPost}>
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{post.post}</div>
      </CardContent>
    </Card>
  )
}

