"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Settings,
  ExternalLink,
} from "lucide-react"

export default function PlatformsPage() {
  const [showAddPlatform, setShowAddPlatform] = useState(false)
  const [newPlatformUrl, setNewPlatformUrl] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")

  const connectedPlatforms = [
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/c/techwithsarah",
      status: "connected",
      followers: "125K",
      lastSync: "2 minutes ago",
      contentAnalyzed: 47,
      color: "from-red-500 to-red-600",
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/techwithsarah",
      status: "connected",
      followers: "89K",
      lastSync: "5 minutes ago",
      contentAnalyzed: 234,
      color: "from-blue-400 to-blue-500",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/techwithsarah",
      status: "analyzing",
      followers: "67K",
      lastSync: "Analyzing...",
      contentAnalyzed: 89,
      color: "from-pink-500 to-purple-500",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/in/sarahchen",
      status: "connected",
      followers: "23K",
      lastSync: "8 minutes ago",
      contentAnalyzed: 56,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "blog",
      name: "Personal Blog",
      icon: Globe,
      url: "https://techwithsarah.com",
      status: "error",
      followers: "15K monthly",
      lastSync: "Failed",
      contentAnalyzed: 23,
      color: "from-green-500 to-green-600",
    },
  ]

  const availablePlatforms = [
    { id: "tiktok", name: "TikTok", icon: Globe, placeholder: "https://tiktok.com/@username" },
    { id: "pinterest", name: "Pinterest", icon: Globe, placeholder: "https://pinterest.com/username" },
    { id: "medium", name: "Medium", icon: Globe, placeholder: "https://medium.com/@username" },
    { id: "podcast", name: "Podcast", icon: Globe, placeholder: "https://podcasts.apple.com/podcast/id" },
    { id: "newsletter", name: "Newsletter", icon: Globe, placeholder: "https://newsletter-platform.com/username" },
  ]

  const handleAddPlatform = () => {
    if (newPlatformUrl && selectedPlatform) {
      // Here you would typically make an API call to add the platform
      console.log("Adding platform:", selectedPlatform, newPlatformUrl)
      setShowAddPlatform(false)
      setNewPlatformUrl("")
      setSelectedPlatform("")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "analyzing":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "border-green-500/50"
      case "analyzing":
        return "border-blue-500/50"
      case "error":
        return "border-red-500/50"
      default:
        return "border-gray-500/50"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Connected Platforms</h1>
          <p className="text-slate-400">Manage your connected social media and content platforms</p>
        </div>
        <Button onClick={() => setShowAddPlatform(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectedPlatforms.map((platform) => (
          <Card
            key={platform.id}
            className={`bg-slate-800/50 border-2 transition-all duration-300 hover:scale-105 ${getStatusColor(platform.status)}`}
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
                    <CardTitle className="text-white text-lg">{platform.name}</CardTitle>
                    <p className="text-sm text-slate-400">{platform.followers} followers</p>
                  </div>
                </div>
                {getStatusIcon(platform.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">{platform.url}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Content Analyzed</span>
                <Badge variant="outline" className="text-white border-slate-600">
                  {platform.contentAnalyzed}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Last Sync</span>
                <span className="text-sm text-white">{platform.lastSync}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 bg-transparent">
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Platform Modal */}
      {showAddPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Add New Platform</CardTitle>
              <p className="text-slate-400">Connect a new platform to sync your content</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Select Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePlatforms.map((platform) => (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      className={`justify-start ${
                        selectedPlatform === platform.id
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-slate-600 text-slate-300"
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <platform.icon className="w-4 h-4 mr-2" />
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedPlatform && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Platform URL</label>
                  <Input
                    placeholder={availablePlatforms.find((p) => p.id === selectedPlatform)?.placeholder}
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddPlatform}
                  disabled={!newPlatformUrl || !selectedPlatform}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Connect Platform
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddPlatform(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Analysis Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Content Analysis Status</CardTitle>
          <p className="text-slate-400">AI analysis of your content across all platforms</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Creator Profile Analysis</p>
                <p className="text-xs text-slate-400">Analyzing your unique voice and content style</p>
              </div>
              <Badge className="bg-green-600 text-white">Complete</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Content Inventory</p>
                <p className="text-xs text-slate-400">Cataloging all existing content across platforms</p>
              </div>
              <Badge className="bg-blue-600 text-white">In Progress</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Gap Detection</p>
                <p className="text-xs text-slate-400">Identifying missing content opportunities</p>
              </div>
              <Badge className="bg-yellow-600 text-white">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
