"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Zap,
} from "lucide-react"

export default function ContentGapsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGap, setSelectedGap] = useState(null)
  const [filterPriority, setFilterPriority] = useState("all")

  const contentGaps = [
    {
      id: "gap-001",
      title: "React Hooks Deep Dive Tutorial",
      sourceContent: {
        platform: "YouTube",
        icon: Youtube,
        url: "https://youtube.com/watch?v=abc123",
        type: "Video Tutorial",
        engagement: 15420,
        publishDate: "2024-01-15",
      },
      missingPlatforms: [
        { name: "Blog", icon: Globe, estimatedReach: 5200, difficulty: "medium" },
        { name: "Twitter", icon: Twitter, estimatedReach: 8900, difficulty: "easy" },
        { name: "LinkedIn", icon: Linkedin, estimatedReach: 3400, difficulty: "medium" },
      ],
      priority: "high",
      estimatedTime: "4-6 hours",
      potentialReach: 17500,
      aiConfidence: 92,
      tags: ["React", "JavaScript", "Tutorial", "Frontend"],
    },
    {
      id: "gap-002",
      title: "CSS Grid Layout Best Practices",
      sourceContent: {
        platform: "Blog",
        icon: Globe,
        url: "https://techwithsarah.com/css-grid-guide",
        type: "Article",
        engagement: 8900,
        publishDate: "2024-01-10",
      },
      missingPlatforms: [
        { name: "YouTube", icon: Youtube, estimatedReach: 12000, difficulty: "high" },
        { name: "Instagram", icon: Instagram, estimatedReach: 4500, difficulty: "medium" },
        { name: "Twitter", icon: Twitter, estimatedReach: 6700, difficulty: "easy" },
      ],
      priority: "medium",
      estimatedTime: "6-8 hours",
      potentialReach: 23200,
      aiConfidence: 87,
      tags: ["CSS", "Web Design", "Layout", "Frontend"],
    },
    {
      id: "gap-003",
      title: "JavaScript Performance Tips",
      sourceContent: {
        platform: "Twitter",
        icon: Twitter,
        url: "https://twitter.com/techwithsarah/status/123",
        type: "Thread",
        engagement: 3400,
        publishDate: "2024-01-12",
      },
      missingPlatforms: [
        { name: "YouTube", icon: Youtube, estimatedReach: 18000, difficulty: "high" },
        { name: "Blog", icon: Globe, estimatedReach: 7800, difficulty: "medium" },
        { name: "LinkedIn", icon: Linkedin, estimatedReach: 4200, difficulty: "easy" },
      ],
      priority: "high",
      estimatedTime: "5-7 hours",
      potentialReach: 30000,
      aiConfidence: 95,
      tags: ["JavaScript", "Performance", "Optimization", "Tips"],
    },
    {
      id: "gap-004",
      title: "Web Accessibility Fundamentals",
      sourceContent: {
        platform: "LinkedIn",
        icon: Linkedin,
        url: "https://linkedin.com/posts/sarahchen_accessibility",
        type: "Article",
        engagement: 2100,
        publishDate: "2024-01-08",
      },
      missingPlatforms: [
        { name: "YouTube", icon: Youtube, estimatedReach: 14000, difficulty: "high" },
        { name: "Blog", icon: Globe, estimatedReach: 6500, difficulty: "medium" },
        { name: "Instagram", icon: Instagram, estimatedReach: 3800, difficulty: "medium" },
      ],
      priority: "low",
      estimatedTime: "4-5 hours",
      potentialReach: 24300,
      aiConfidence: 89,
      tags: ["Accessibility", "Web Development", "UX", "Inclusive Design"],
    },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const filteredGaps = contentGaps.filter((gap) => {
    const matchesSearch =
      gap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesPriority = filterPriority === "all" || gap.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Gaps</h1>
          <p className="text-slate-400">Identify and prioritize missing content opportunities</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          Auto-Fill All Gaps
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Gaps</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">High Priority</p>
                <p className="text-2xl font-bold text-red-400">8</p>
              </div>
              <Target className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Potential Reach</p>
                <p className="text-2xl font-bold text-green-400">156K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Est. Time</p>
                <p className="text-2xl font-bold text-blue-400">42h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search content gaps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          {["all", "high", "medium", "low"].map((priority) => (
            <Button
              key={priority}
              variant={filterPriority === priority ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority(priority)}
              className={filterPriority === priority ? "bg-purple-600" : "border-slate-600 text-slate-300"}
            >
              {priority === "all" ? "All" : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Gaps List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGaps.map((gap) => (
          <Card
            key={gap.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedGap(gap)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg mb-2">{gap.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <gap.sourceContent.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      Source: {gap.sourceContent.platform} • {gap.sourceContent.type}
                    </span>
                  </div>
                </div>
                <Badge className={getPriorityColor(gap.priority)}>{gap.priority.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {gap.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-400">Missing on {gap.missingPlatforms.length} platforms:</p>
                <div className="flex gap-2">
                  {gap.missingPlatforms.map((platform, index) => (
                    <div key={index} className="flex items-center gap-1 bg-slate-700/50 rounded px-2 py-1">
                      <platform.icon className="w-3 h-3" />
                      <span className="text-xs text-white">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Potential Reach</p>
                  <p className="text-white font-semibold">{gap.potentialReach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Est. Time</p>
                  <p className="text-white font-semibold">{gap.estimatedTime}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-400">AI Confidence: {gap.aiConfidence}%</span>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Fill Gap
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gap Detail Modal */}
      {selectedGap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">{selectedGap.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <selectedGap.sourceContent.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    Source: {selectedGap.sourceContent.platform} •{" "}
                    {selectedGap.sourceContent.engagement.toLocaleString()} engagements
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedGap(null)} className="text-slate-400 hover:text-white">
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Source Content</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <selectedGap.sourceContent.icon className="w-6 h-6" />
                        <div>
                          <p className="text-white font-medium">{selectedGap.sourceContent.platform}</p>
                          <p className="text-sm text-slate-400">{selectedGap.sourceContent.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Published: {selectedGap.sourceContent.publishDate}</p>
                      <p className="text-sm text-slate-400">
                        Engagement: {selectedGap.sourceContent.engagement.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Content Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGap.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-slate-600 text-slate-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Missing Platforms</h3>
                    <div className="space-y-3">
                      {selectedGap.missingPlatforms.map((platform, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <platform.icon className="w-5 h-5" />
                              <span className="text-white font-medium">{platform.name}</span>
                            </div>
                            <span className={`text-sm ${getDifficultyColor(platform.difficulty)}`}>
                              {platform.difficulty} difficulty
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            Est. reach: {platform.estimatedReach.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gap Analysis</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Priority:</span>
                        <Badge className={getPriorityColor(selectedGap.priority)}>
                          {selectedGap.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Potential Reach:</span>
                        <span className="text-white">{selectedGap.potentialReach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Time:</span>
                        <span className="text-white">{selectedGap.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">AI Confidence:</span>
                        <span className="text-green-400">{selectedGap.aiConfidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Start AI Repurposing
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  View Source Content
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  Schedule for Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
