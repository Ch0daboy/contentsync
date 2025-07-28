"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Play, Pause, CheckCircle, AlertTriangle, Plus } from "lucide-react"
import { getPlatformLogo } from "@/components/platform-logos"

export default function SchedulePage() {
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  const scheduledPosts = [
    {
      id: "SCH-001",
      title: "JavaScript ES6 Features Deep Dive",
      platforms: ["YouTube", "Twitter", "LinkedIn", "Blog"],
      scheduledTime: "2025-06-18 10:00 AM",
      status: "scheduled",
      priority: "high",
      estimatedReach: "45K",
      contentType: "Tutorial",
      description: "Comprehensive guide to modern JavaScript ES6 features with practical examples",
      duration: "15 min video",
      tags: ["javascript", "es6", "tutorial", "webdev"],
    },
    {
      id: "SCH-002",
      title: "React Hooks Best Practices",
      platforms: ["TikTok", "Instagram", "Pinterest"],
      scheduledTime: "2025-06-18 02:00 PM",
      status: "scheduled",
      priority: "medium",
      estimatedReach: "28K",
      contentType: "Short Form",
      description: "Quick tips on React Hooks best practices for better component design",
      duration: "60 sec video",
      tags: ["react", "hooks", "tips", "frontend"],
    },
    {
      id: "SCH-003",
      title: "CSS Grid Layout Masterclass",
      platforms: ["YouTube", "Blog", "Newsletter"],
      scheduledTime: "2025-06-18 06:00 PM",
      status: "publishing",
      priority: "high",
      estimatedReach: "52K",
      contentType: "Masterclass",
      description: "Complete CSS Grid layout tutorial with real-world project examples",
      duration: "25 min video",
      tags: ["css", "grid", "layout", "design"],
    },
    {
      id: "SCH-004",
      title: "Web Development Career Tips",
      platforms: ["LinkedIn", "Twitter", "Facebook"],
      scheduledTime: "2025-06-19 09:00 AM",
      status: "scheduled",
      priority: "medium",
      estimatedReach: "34K",
      contentType: "Career Advice",
      description: "Essential career advice for aspiring web developers in 2025",
      duration: "Thread/Article",
      tags: ["career", "webdev", "advice", "growth"],
    },
    {
      id: "SCH-005",
      title: "Node.js Performance Optimization",
      platforms: ["YouTube", "Blog", "LinkedIn", "Newsletter"],
      scheduledTime: "2025-06-19 03:00 PM",
      status: "draft",
      priority: "high",
      estimatedReach: "41K",
      contentType: "Technical Guide",
      description: "Advanced Node.js performance optimization techniques for production apps",
      duration: "20 min video",
      tags: ["nodejs", "performance", "backend", "optimization"],
    },
    {
      id: "SCH-006",
      title: "Frontend Framework Comparison 2025",
      platforms: ["YouTube", "TikTok", "Instagram", "Twitter", "Blog"],
      scheduledTime: "2025-06-20 11:00 AM",
      status: "scheduled",
      priority: "critical",
      estimatedReach: "67K",
      contentType: "Comparison",
      description: "Comprehensive comparison of popular frontend frameworks in 2025",
      duration: "18 min video",
      tags: ["frontend", "frameworks", "comparison", "2025"],
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-white/20 text-white"
      case "publishing":
        return "bg-emerald-600/20 text-emerald-600"
      case "draft":
        return "bg-orange-500/20 text-orange-500"
      case "failed":
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
      case "scheduled":
        return <Clock className="w-4 h-4" />
      case "publishing":
        return <Play className="w-4 h-4" />
      case "draft":
        return <Pause className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-black via-neutral-900 to-emerald-900/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">SCHEDULE</h1>
          <p className="text-sm text-neutral-400">Manage and schedule content across all platforms</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">SCHEDULED</p>
                <p className="text-2xl font-bold text-white font-mono">18</p>
              </div>
              <Clock className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">PUBLISHING</p>
                <p className="text-2xl font-bold text-emerald-600 font-mono">3</p>
              </div>
              <Play className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">DRAFTS</p>
                <p className="text-2xl font-bold text-orange-500 font-mono">7</p>
              </div>
              <Pause className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">PUBLISHED TODAY</p>
                <p className="text-2xl font-bold text-white font-mono">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {scheduledPosts.map((post) => (
          <Card
            key={post.id}
            className="bg-neutral-900 border-neutral-700 hover:border-emerald-600/50 transition-colors cursor-pointer"
            onClick={() => setSelectedSchedule(post)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wider">{post.title}</CardTitle>
                  <p className="text-xs text-neutral-400 mt-1">{post.contentType}</p>
                </div>
                <div className="flex items-center gap-2">{getStatusIcon(post.status)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(post.status)}>{post.status.toUpperCase()}</Badge>
                <Badge className={getPriorityColor(post.priority)}>{post.priority.toUpperCase()}</Badge>
              </div>

              <p className="text-sm text-neutral-300">{post.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  <span>{post.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" />
                  <span>{post.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Play className="w-3 h-3" />
                  <span>Est. reach: {post.estimatedReach}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-400 mb-2">PLATFORMS ({post.platforms.length})</p>
                <div className="flex flex-wrap gap-2">
                  {post.platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-1 bg-neutral-800 rounded px-2 py-1">
                      {getPlatformLogo(platform.toLowerCase(), "w-3 h-3")}
                      <span className="text-xs text-neutral-300">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-neutral-400 mb-2">TAGS</p>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} className="bg-neutral-800 text-neutral-300 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white tracking-wider">{selectedSchedule.title}</CardTitle>
                <p className="text-sm text-neutral-400 font-mono">{selectedSchedule.id}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedSchedule(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SCHEDULE STATUS</h3>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedSchedule.status)}>
                        {selectedSchedule.status.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(selectedSchedule.priority)}>
                        {selectedSchedule.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SCHEDULE DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Scheduled Time:</span>
                        <span className="text-white font-mono">{selectedSchedule.scheduledTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Content Type:</span>
                        <span className="text-white">{selectedSchedule.contentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Duration:</span>
                        <span className="text-white font-mono">{selectedSchedule.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Est. Reach:</span>
                        <span className="text-white font-mono">{selectedSchedule.estimatedReach}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">PLATFORMS</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSchedule.platforms.map((platform) => (
                        <div key={platform} className="flex items-center gap-2 bg-neutral-800 rounded px-3 py-2">
                          {getPlatformLogo(platform.toLowerCase(), "w-4 h-4")}
                          <span className="text-sm text-neutral-300">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSchedule.tags.map((tag) => (
                        <Badge key={tag} className="bg-neutral-800 text-neutral-300">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">DESCRIPTION</h3>
                <p className="text-sm text-neutral-300">{selectedSchedule.description}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Edit Schedule</Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Publish Now
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  className="border-red-700 text-red-400 hover:bg-red-800 hover:text-red-300 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
