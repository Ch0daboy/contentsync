"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Send,
  Calendar,
} from "lucide-react"

export default function ReviewPage() {
  const [selectedContent, setSelectedContent] = useState(null)
  const [editingContent, setEditingContent] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const reviewQueue = [
    {
      id: "review-001",
      title: "React Hooks Deep Dive - Blog Post",
      platform: "Blog",
      icon: Globe,
      status: "pending",
      priority: "high",
      content:
        "# React Hooks Deep Dive: A Comprehensive Guide\n\nReact Hooks revolutionized how we write React components by allowing us to use state and other React features without writing a class component...",
      sourceContent: "YouTube: React Hooks Tutorial (24:30)",
      aiConfidence: 94,
      wordCount: 2400,
      estimatedReadTime: "12 min read",
      createdAt: "2024-01-15T10:30:00Z",
      scheduledFor: "2024-01-16T09:00:00Z",
    },
    {
      id: "review-002",
      title: "CSS Grid Tips - Twitter Thread",
      platform: "Twitter",
      icon: Twitter,
      status: "approved",
      priority: "medium",
      content:
        "🧵 THREAD: CSS Grid Layout Tips\n\n1/ CSS Grid is incredibly powerful for creating complex layouts. Here are my top 5 tips...\n\n2/ Use grid-template-areas for readable code...",
      sourceContent: "Blog: CSS Grid Best Practices",
      aiConfidence: 96,
      wordCount: 280,
      estimatedReadTime: "2 min read",
      createdAt: "2024-01-15T08:15:00Z",
      scheduledFor: "2024-01-15T15:00:00Z",
    },
    {
      id: "review-003",
      title: "JavaScript Performance - LinkedIn Article",
      platform: "LinkedIn",
      icon: Linkedin,
      status: "needs_revision",
      priority: "medium",
      content:
        "JavaScript Performance Optimization: A Developer's Guide\n\nPerformance is crucial for user experience. Here's how to optimize your JavaScript code for better performance...",
      sourceContent: "Twitter: JS Performance Thread",
      aiConfidence: 87,
      wordCount: 1800,
      estimatedReadTime: "8 min read",
      createdAt: "2024-01-14T16:45:00Z",
      scheduledFor: "2024-01-17T10:00:00Z",
      feedback: "Content needs more specific examples and code snippets",
    },
    {
      id: "review-004",
      title: "Web Accessibility - Instagram Post",
      platform: "Instagram",
      icon: Instagram,
      status: "pending",
      priority: "low",
      content:
        "🌐 Web Accessibility Matters!\n\n✨ Alt text for images\n🎯 Proper heading structure\n⌨️ Keyboard navigation\n🎨 Color contrast\n\n#WebAccessibility #InclusiveDesign #WebDev",
      sourceContent: "LinkedIn: Accessibility Article",
      aiConfidence: 92,
      wordCount: 150,
      estimatedReadTime: "1 min read",
      createdAt: "2024-01-14T12:20:00Z",
      scheduledFor: "2024-01-16T14:00:00Z",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "needs_revision":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "needs_revision":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "low":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const handleApprove = (contentId) => {
    console.log("Approving content:", contentId)
  }

  const handleReject = (contentId, feedback) => {
    console.log("Rejecting content:", contentId, "Feedback:", feedback)
  }

  const handleSchedule = (contentId, scheduleTime) => {
    console.log("Scheduling content:", contentId, "for:", scheduleTime)
  }

  const filteredContent = reviewQueue.filter((item) => filterStatus === "all" || item.status === filterStatus)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Review Queue</h1>
          <p className="text-slate-400">Review and approve AI-generated content before publishing</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-green-400">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Needs Revision</p>
                <p className="text-2xl font-bold text-red-400">3</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Scheduled</p>
                <p className="text-2xl font-bold text-blue-400">15</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "needs_revision", "scheduled"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? "bg-purple-600" : "border-slate-600 text-slate-300"}
          >
            {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContent.map((item) => (
          <Card
            key={item.id}
            className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-slate-400">Source: {item.sourceContent}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ").toUpperCase()}</Badge>
                  <Badge className={getPriorityColor(item.priority)}>{item.priority.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/50 rounded p-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-slate-300 line-clamp-4">{item.content.substring(0, 200)}...</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Word Count</p>
                  <p className="text-white font-semibold">{item.wordCount}</p>
                </div>
                <div>
                  <p className="text-slate-400">Read Time</p>
                  <p className="text-white font-semibold">{item.estimatedReadTime}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-400">AI Confidence: {item.aiConfidence}%</span>
                </div>
                <span className="text-xs text-slate-400">
                  Scheduled: {new Date(item.scheduledFor).toLocaleDateString()}
                </span>
              </div>

              {item.feedback && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                  <p className="text-sm text-red-400">{item.feedback}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                  onClick={() => setSelectedContent(item)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Review
                </Button>
                {item.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(item.id)}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 bg-transparent"
                      onClick={() => handleReject(item.id, "Needs revision")}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Review Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <selectedContent.icon className="w-6 h-6" />
                <div>
                  <CardTitle className="text-white">{selectedContent.title}</CardTitle>
                  <p className="text-sm text-slate-400">Source: {selectedContent.sourceContent}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedContent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedContent.status)}>
                    {selectedContent.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Priority</p>
                  <Badge className={getPriorityColor(selectedContent.priority)}>
                    {selectedContent.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">AI Confidence</p>
                  <p className="text-white">{selectedContent.aiConfidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Scheduled For</p>
                  <p className="text-white">{new Date(selectedContent.scheduledFor).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Content Preview</h3>
                <Textarea
                  value={editingContent || selectedContent.content}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="min-h-[400px] bg-slate-700 border-slate-600 text-white"
                  placeholder="Content will appear here..."
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selectedContent.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Schedule
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 bg-transparent"
                  onClick={() => {
                    // Save edits logic here
                    console.log("Saving edits:", editingContent)
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-400 bg-transparent"
                  onClick={() => handleReject(selectedContent.id, "Needs major revision")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
