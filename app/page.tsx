"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Users,
} from "lucide-react"

export default function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState(null)

  const platforms = [
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      url: "youtube.com/c/techwithsarah",
      status: "synced",
      lastSync: "2 minutes ago",
      contentCount: 47,
      gapsCount: 0,
      engagement: 94,
      color: "from-red-500 to-red-600",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      url: "twitter.com/techwithsarah",
      status: "gaps",
      lastSync: "5 minutes ago",
      contentCount: 234,
      gapsCount: 12,
      engagement: 87,
      color: "from-blue-400 to-blue-500",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      url: "instagram.com/techwithsarah",
      status: "synced",
      lastSync: "1 minute ago",
      contentCount: 89,
      gapsCount: 2,
      engagement: 91,
      color: "from-pink-500 to-purple-500",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      url: "linkedin.com/in/sarahchen",
      status: "gaps",
      lastSync: "8 minutes ago",
      contentCount: 56,
      gapsCount: 8,
      engagement: 78,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "blog",
      name: "Blog",
      icon: Globe,
      url: "techwithsarah.com",
      status: "syncing",
      lastSync: "Syncing...",
      contentCount: 23,
      gapsCount: 15,
      engagement: 85,
      color: "from-green-500 to-green-600",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Globe,
      url: "tiktok.com/@techwithsarah",
      status: "gaps",
      lastSync: "12 minutes ago",
      contentCount: 156,
      gapsCount: 23,
      engagement: 96,
      color: "from-gray-800 to-gray-900",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "gaps":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "syncing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "synced":
        return "border-green-500/50 shadow-green-500/20"
      case "gaps":
        return "border-yellow-500/50 shadow-yellow-500/20"
      case "syncing":
        return "border-blue-500/50 shadow-blue-500/20"
      default:
        return "border-red-500/50 shadow-red-500/20"
    }
  }

  const recentActivity = [
    {
      id: 1,
      action: "Content repurposed",
      source: "YouTube: React Hooks Tutorial",
      target: "Blog post created",
      time: "5 minutes ago",
      status: "completed",
    },
    {
      id: 2,
      action: "Gap detected",
      source: "Instagram: Design Tips",
      target: "Missing on Twitter, LinkedIn",
      time: "12 minutes ago",
      status: "pending",
    },
    {
      id: 3,
      action: "Auto-sync completed",
      source: "TikTok: Quick CSS Tips",
      target: "Instagram Reel created",
      time: "1 hour ago",
      status: "completed",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Dashboard</h1>
          <p className="text-slate-400">Monitor and synchronize your content across all platforms</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Zap className="w-4 h-4 mr-2" />
            Sync All Platforms
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Content</p>
                <p className="text-2xl font-bold text-white">605</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Content Gaps</p>
                <p className="text-2xl font-bold text-yellow-500">60</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Engagement</p>
                <p className="text-2xl font-bold text-green-500">88%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Platforms</p>
                <p className="text-2xl font-bold text-white">6</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`bg-slate-800/50 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${getStatusColor(platform.status)}`}
            onClick={() => setSelectedPlatform(platform)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center`}
                  >
                    <platform.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{platform.name}</CardTitle>
                    <p className="text-sm text-slate-400">{platform.url}</p>
                  </div>
                </div>
                {getStatusIcon(platform.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Content</span>
                <span className="text-sm font-medium text-white">{platform.contentCount}</span>
              </div>

              {platform.gapsCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Gaps</span>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    {platform.gapsCount}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Engagement</span>
                  <span className="text-sm font-medium text-white">{platform.engagement}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${platform.engagement}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500">Last sync: {platform.lastSync}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400">
                      {activity.source} → {activity.target}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Detail Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedPlatform.color} flex items-center justify-center`}
                >
                  <selectedPlatform.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">{selectedPlatform.name}</CardTitle>
                  <p className="text-sm text-slate-400">{selectedPlatform.url}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedPlatform(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPlatform.status)}
                    <span className="text-sm text-white capitalize">{selectedPlatform.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Content Count</p>
                  <p className="text-lg font-semibold text-white">{selectedPlatform.contentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Content Gaps</p>
                  <p className="text-lg font-semibold text-yellow-500">{selectedPlatform.gapsCount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Engagement Rate</p>
                  <p className="text-lg font-semibold text-green-500">{selectedPlatform.engagement}%</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  View Content
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                  Fill Gaps
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
