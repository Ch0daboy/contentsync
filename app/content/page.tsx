"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Clock, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react"

export default function ContentPage() {
  const [selectedGap, setSelectedGap] = useState(null)

  const contentGaps = [
    {
      id: "GAP-001",
      topic: "REACT TUTORIAL SERIES",
      status: "critical",
      priority: "high",
      platforms: ["Twitter", "LinkedIn", "Blog"],
      missingContent: 3,
      coverage: 25,
      originalPost: "YouTube Video",
      estimatedTime: "2 hours",
      description: "Repurpose React tutorial video into Twitter thread, LinkedIn article, and blog post",
      suggestions: [
        "Create Twitter thread with key points",
        "Write detailed LinkedIn article",
        "Publish comprehensive blog post",
      ],
    },
    {
      id: "GAP-002",
      topic: "PRODUCTIVITY TIPS",
      status: "active",
      priority: "medium",
      platforms: ["TikTok", "Instagram"],
      missingContent: 2,
      coverage: 60,
      originalPost: "YouTube Short",
      estimatedTime: "1 hour",
      description: "Adapt productivity tips video for TikTok and Instagram Reels",
      suggestions: ["Create TikTok version with trending audio", "Post Instagram Reel with captions"],
    },
    {
      id: "GAP-003",
      topic: "CODING BEST PRACTICES",
      status: "completed",
      priority: "low",
      platforms: [],
      missingContent: 0,
      coverage: 100,
      originalPost: "Blog Article",
      estimatedTime: "0 hours",
      description: "Successfully distributed across all platforms",
      suggestions: [],
    },
    {
      id: "GAP-004",
      topic: "TECH CAREER ADVICE",
      status: "planning",
      priority: "high",
      platforms: ["Newsletter", "Twitter", "LinkedIn"],
      missingContent: 3,
      coverage: 10,
      originalPost: "Podcast Episode",
      estimatedTime: "3 hours",
      description: "Transform podcast content into newsletter, Twitter thread, and LinkedIn post",
      suggestions: [
        "Extract key quotes for newsletter",
        "Create Twitter thread with actionable tips",
        "Write LinkedIn thought leadership post",
      ],
    },
    {
      id: "GAP-005",
      topic: "DESIGN TRENDS 2025",
      status: "overdue",
      priority: "critical",
      platforms: ["Instagram", "Pinterest", "Blog"],
      missingContent: 3,
      coverage: 0,
      originalPost: "YouTube Video",
      estimatedTime: "4 hours",
      description: "Create visual content for design trends across visual platforms",
      suggestions: ["Design Instagram carousel", "Create Pinterest boards", "Write detailed blog analysis"],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-white/20 text-white"
      case "planning":
        return "bg-orange-500/20 text-orange-500"
      case "completed":
        return "bg-white/20 text-white"
      case "critical":
        return "bg-red-500/20 text-red-500"
      case "overdue":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-neutral-500/20 text-neutral-300"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-500"
      case "high":
        return "bg-orange-500/20 text-orange-500"
      case "medium":
        return "bg-neutral-500/20 text-neutral-300"
      case "low":
        return "bg-white/20 text-white"
      default:
        return "bg-neutral-500/20 text-neutral-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <TrendingUp className="w-4 h-4" />
      case "planning":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "critical":
        return <AlertCircle className="w-4 h-4" />
      case "overdue":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-black via-neutral-900 to-emerald-900/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">CONTENT</h1>
          <p className="text-sm text-neutral-400">Identify and fill content distribution gaps</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">ACTIVE GAPS</p>
                <p className="text-2xl font-bold text-white font-mono">12</p>
              </div>
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">FILLED TODAY</p>
                <p className="text-2xl font-bold text-white font-mono">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">OVERDUE</p>
                <p className="text-2xl font-bold text-red-500 font-mono">3</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">COMPLETION RATE</p>
                <p className="text-2xl font-bold text-white font-mono">76%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Gaps List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contentGaps.map((gap) => (
          <Card
            key={gap.id}
            className="bg-neutral-900 border-neutral-700 hover:border-emerald-600/50 transition-colors cursor-pointer"
            onClick={() => setSelectedGap(gap)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wider">{gap.topic}</CardTitle>
                </div>
                <div className="flex items-center gap-2">{getStatusIcon(gap.status)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(gap.status)}>{gap.status.toUpperCase()}</Badge>
                <Badge className={getPriorityColor(gap.priority)}>{gap.priority.toUpperCase()}</Badge>
              </div>

              <p className="text-sm text-neutral-300">{gap.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  <span>Missing on: {gap.platforms.join(", ") || "All platforms covered"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Users className="w-3 h-3" />
                  <span>{gap.missingContent} platforms need content</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" />
                  <span>Est. time: {gap.estimatedTime}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Coverage</span>
                  <span className="text-white font-mono">{gap.coverage}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${gap.coverage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gap Detail Modal */}
      {selectedGap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white tracking-wider">{selectedGap.topic}</CardTitle>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedGap(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">GAP STATUS</h3>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedGap.status)}>{selectedGap.status.toUpperCase()}</Badge>
                      <Badge className={getPriorityColor(selectedGap.priority)}>
                        {selectedGap.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">CONTENT DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Original Post:</span>
                        <span className="text-white">{selectedGap.originalPost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Missing Platforms:</span>
                        <span className="text-white font-mono">{selectedGap.missingContent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Estimated Time:</span>
                        <span className="text-white font-mono">{selectedGap.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">COVERAGE</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Completion</span>
                        <span className="text-white font-mono">{selectedGap.coverage}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-3">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedGap.coverage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">MISSING PLATFORMS</h3>
                    <div className="space-y-2">
                      {selectedGap.platforms.map((platform, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-neutral-300">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">DESCRIPTION</h3>
                <p className="text-sm text-neutral-300">{selectedGap.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SUGGESTIONS</h3>
                <div className="space-y-2">
                  {selectedGap.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <span className="text-neutral-300">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Start Creating</Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Schedule Content
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
