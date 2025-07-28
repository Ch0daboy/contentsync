"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  CheckCircle,
  Clock,
  Edit,
  Send,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

export default function RepurposePage() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [editingContent, setEditingContent] = useState(null)

  const repurposingJobs = [
    {
      id: "job-001",
      title: "React Hooks Deep Dive Tutorial",
      sourceContent: {
        platform: "YouTube",
        icon: Youtube,
        type: "Video Tutorial",
        duration: "24:30",
        url: "https://youtube.com/watch?v=abc123",
      },
      targetPlatforms: [
        {
          platform: "Blog",
          icon: Globe,
          status: "completed",
          content:
            "# React Hooks Deep Dive: A Comprehensive Guide\n\nReact Hooks revolutionized how we write React components...",
          wordCount: 2400,
          estimatedReadTime: "12 min read",
          aiConfidence: 94,
        },
        {
          platform: "Twitter",
          icon: Twitter,
          status: "completed",
          content:
            "🧵 THREAD: React Hooks Deep Dive\n\n1/ React Hooks changed everything about how we write components. Here's what you need to know...",
          wordCount: 280,
          estimatedReadTime: "2 min read",
          aiConfidence: 96,
        },
        {
          platform: "LinkedIn",
          icon: Linkedin,
          status: "processing",
          content: "",
          wordCount: 0,
          estimatedReadTime: "",
          aiConfidence: 0,
          progress: 65,
        },
      ],
      createdAt: "2024-01-15T10:30:00Z",
      priority: "high",
    },
    {
      id: "job-002",
      title: "CSS Grid Layout Best Practices",
      sourceContent: {
        platform: "Blog",
        icon: Globe,
        type: "Article",
        duration: "8 min read",
        url: "https://techwithsarah.com/css-grid-guide",
      },
      targetPlatforms: [
        {
          platform: "YouTube",
          icon: Youtube,
          status: "draft",
          content: "Script: Welcome to today's tutorial on CSS Grid Layout Best Practices...",
          wordCount: 1800,
          estimatedReadTime: "15 min video",
          aiConfidence: 89,
        },
        {
          platform: "Instagram",
          icon: Instagram,
          status: "completed",
          content:
            "🎨 CSS Grid Layout Tips!\n\n✨ Use grid-template-areas for readable layouts\n📱 Always test responsive behavior...",
          wordCount: 150,
          estimatedReadTime: "1 min read",
          aiConfidence: 92,
        },
      ],
      createdAt: "2024-01-14T14:20:00Z",
      priority: "medium",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case "draft":
        return <Edit className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const handleApprove = (jobId, platformIndex) => {
    console.log("Approving content for job:", jobId, "platform:", platformIndex)
  }

  const handleReject = (jobId, platformIndex) => {
    console.log("Rejecting content for job:", jobId, "platform:", platformIndex)
  }

  const handleEdit = (jobId, platformIndex, content) => {
    setEditingContent({ jobId, platformIndex, content })
  }

  const saveEdit = () => {
    console.log("Saving edited content:", editingContent)
    setEditingContent(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Content Repurposing</h1>
          <p className="text-slate-400">Transform your content across platforms while maintaining your unique voice</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          New Repurposing Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Jobs</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">24</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-purple-400">94%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repurposing Jobs */}
      <div className="space-y-6">
        {repurposingJobs.map((job) => (
          <Card key={job.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <job.sourceContent.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      Source: {job.sourceContent.platform} • {job.sourceContent.type} • {job.sourceContent.duration}
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    job.priority === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                  }
                >
                  {job.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {job.targetPlatforms.map((target, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <target.icon className="w-5 h-5" />
                          <span className="text-white font-medium">{target.platform}</span>
                        </div>
                        {getStatusIcon(target.status)}
                      </div>
                      <Badge className={getStatusColor(target.status)}>{target.status.toUpperCase()}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {target.status === "processing" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{target.progress}%</span>
                          </div>
                          <Progress value={target.progress} className="h-2" />
                        </div>
                      )}

                      {target.status === "completed" && (
                        <div className="space-y-3">
                          <div className="text-sm text-slate-400">
                            <p>
                              {target.wordCount} words • {target.estimatedReadTime}
                            </p>
                            <p>AI Confidence: {target.aiConfidence}%</p>
                          </div>

                          <div className="bg-slate-800 rounded p-3 max-h-32 overflow-y-auto">
                            <p className="text-sm text-slate-300 line-clamp-4">{target.content.substring(0, 150)}...</p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              onClick={() => handleApprove(job.id, index)}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => handleEdit(job.id, index, target.content)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 bg-transparent"
                              onClick={() => handleReject(job.id, index)}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {target.status === "draft" && (
                        <div className="space-y-3">
                          <div className="text-sm text-slate-400">
                            <p>
                              {target.wordCount} words • {target.estimatedReadTime}
                            </p>
                            <p>AI Confidence: {target.aiConfidence}%</p>
                          </div>

                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 w-full"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Review Draft
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Editor Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Edit Content</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setEditingContent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editingContent.content}
                onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                className="min-h-[400px] bg-slate-700 border-slate-600 text-white"
                placeholder="Edit your content here..."
              />

              <div className="flex gap-2">
                <Button onClick={saveEdit} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingContent(null)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">{selectedJob.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <selectedJob.sourceContent.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    Source: {selectedJob.sourceContent.platform} • {selectedJob.sourceContent.type}
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white">
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedJob.targetPlatforms.map((target, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <target.icon className="w-5 h-5" />
                          <span className="text-white font-medium">{target.platform}</span>
                        </div>
                        <Badge className={getStatusColor(target.status)}>{target.status.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {target.content && (
                        <div className="bg-slate-800 rounded p-4 max-h-64 overflow-y-auto">
                          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{target.content}</pre>
                        </div>
                      )}

                      <div className="text-sm text-slate-400">
                        <p>
                          {target.wordCount} words • {target.estimatedReadTime}
                        </p>
                        <p>AI Confidence: {target.aiConfidence}%</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          onClick={() => handleApprove(selectedJob.id, index)}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 bg-transparent"
                          onClick={() => handleEdit(selectedJob.id, index, target.content)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
