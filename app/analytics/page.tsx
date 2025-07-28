"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, Heart, Target, Zap } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("engagement")

  const platformMetrics = [
    {
      platform: "YouTube",
      color: "from-red-500 to-red-600",
      metrics: {
        views: 45200,
        engagement: 8.4,
        subscribers: 1250,
        avgWatchTime: "4:32",
      },
      trend: "up",
      change: 12.5,
    },
    {
      platform: "Twitter",
      color: "from-blue-400 to-blue-500",
      metrics: {
        views: 89300,
        engagement: 6.7,
        followers: 890,
        avgEngagementTime: "0:45",
      },
      trend: "up",
      change: 8.2,
    },
    {
      platform: "Instagram",
      color: "from-pink-500 to-purple-500",
      metrics: {
        views: 34500,
        engagement: 9.1,
        followers: 567,
        avgEngagementTime: "1:12",
      },
      trend: "down",
      change: -3.1,
    },
    {
      platform: "LinkedIn",
      color: "from-blue-600 to-blue-700",
      metrics: {
        views: 12800,
        engagement: 5.9,
        connections: 234,
        avgEngagementTime: "2:15",
      },
      trend: "up",
      change: 15.7,
    },
  ]

  const contentPerformance = [
    {
      title: "React Hooks Deep Dive Tutorial",
      platform: "YouTube",
      publishDate: "2024-01-15",
      views: 15420,
      engagement: 12.3,
      repurposed: 3,
      totalReach: 28900,
      roi: 340,
    },
    {
      title: "CSS Grid Layout Best Practices",
      platform: "Blog",
      publishDate: "2024-01-12",
      views: 8900,
      engagement: 7.8,
      repurposed: 2,
      totalReach: 15600,
      roi: 275,
    },
    {
      title: "JavaScript Performance Tips",
      platform: "Twitter",
      publishDate: "2024-01-10",
      views: 23400,
      engagement: 9.2,
      repurposed: 4,
      totalReach: 45200,
      roi: 420,
    },
  ]

  const syncEffectiveness = {
    totalContent: 156,
    syncedContent: 134,
    avgSyncTime: "2.3 hours",
    successRate: 94.2,
    totalReachIncrease: 340,
    engagementBoost: 67,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">Track your content performance across all platforms</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-purple-600" : "border-slate-600 text-slate-300"}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reach</p>
                <p className="text-2xl font-bold text-white">234K</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+23.5%</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Engagement</p>
                <p className="text-2xl font-bold text-white">8.2%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+1.8%</span>
                </div>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Content Synced</p>
                <p className="text-2xl font-bold text-white">134</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+12</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">ROI Increase</p>
                <p className="text-2xl font-bold text-white">340%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+45%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Platform Performance</CardTitle>
          <p className="text-slate-400">Compare metrics across all connected platforms</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformMetrics.map((platform, index) => (
              <Card key={index} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{platform.platform}</h3>
                    <div className="flex items-center gap-1">
                      {platform.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm ${platform.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                        {platform.change > 0 ? "+" : ""}
                        {platform.change}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Views</span>
                      <span className="text-white">{platform.metrics.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Engagement</span>
                      <span className="text-white">{platform.metrics.engagement}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Growth</span>
                      <span className="text-white">
                        {platform.metrics.subscribers || platform.metrics.followers || platform.metrics.connections}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Performance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Content</CardTitle>
          <p className="text-slate-400">Content with highest cross-platform impact</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentPerformance.map((content, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{content.title}</h3>
                    <p className="text-sm text-slate-400">
                      {content.platform} • {content.publishDate}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">ROI: {content.roi}%</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Original Views</p>
                    <p className="text-white font-semibold">{content.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Engagement</p>
                    <p className="text-white font-semibold">{content.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Repurposed</p>
                    <p className="text-white font-semibold">{content.repurposed} platforms</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Reach</p>
                    <p className="text-white font-semibold">{content.totalReach.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Reach Multiplier</p>
                    <p className="text-green-400 font-semibold">{(content.totalReach / content.views).toFixed(1)}x</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sync Effectiveness</CardTitle>
            <p className="text-slate-400">How well your content synchronization is performing</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Success Rate</span>
              <span className="text-2xl font-bold text-green-400">{syncEffectiveness.successRate}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Sync Time</span>
              <span className="text-white font-semibold">{syncEffectiveness.avgSyncTime}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Content Synced</span>
              <span className="text-white font-semibold">
                {syncEffectiveness.syncedContent}/{syncEffectiveness.totalContent}
              </span>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: `${(syncEffectiveness.syncedContent / syncEffectiveness.totalContent) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Impact Metrics</CardTitle>
            <p className="text-slate-400">The effect of cross-platform synchronization</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Reach Increase</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{syncEffectiveness.totalReachIncrease}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Engagement Boost</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold">+{syncEffectiveness.engagementBoost}%</span>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-sm text-slate-300">
                Your content synchronization strategy has increased your total reach by{" "}
                <span className="text-green-400 font-semibold">{syncEffectiveness.totalReachIncrease}%</span> compared
                to single-platform publishing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
