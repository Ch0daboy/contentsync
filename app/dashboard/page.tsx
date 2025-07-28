"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlatformCard } from "@/components/platform-card"
import { Plus, Zap, TrendingUp, FileText, Users } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [platforms, setPlatforms] = useState([])
  const [stats, setStats] = useState({
    totalPlatforms: 0,
    totalContent: 0,
    unseenAdaptations: 0,
    totalReach: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch platforms
      const platformsRes = await fetch('/api/platforms')
      const platformsData = await platformsRes.json()
      
      // Fetch unseen generated content
      const contentRes = await fetch('/api/content?type=generated&status=UNSEEN')
      const unseenContent = await contentRes.json()
      
      setPlatforms(platformsData)
      
      // Calculate stats
      const totalContent = platformsData.reduce((sum: number, p: any) => 
        sum + p._count.originalContent, 0
      )
      
      setStats({
        totalPlatforms: platformsData.length,
        totalContent,
        unseenAdaptations: unseenContent.length,
        totalReach: totalContent * 1000 // Mock calculation
      })
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlatform = async (platformId: string) => {
    try {
      await fetch(`/api/platforms?id=${platformId}`, {
        method: 'DELETE'
      })
      fetchDashboardData()
    } catch (error) {
      console.error('Failed to delete platform:', error)
    }
  }

  const handleRefreshPlatform = async (platformId: string) => {
    try {
      // Trigger manual refresh
      await fetch('/api/cron/monitor', {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
        }
      })
      fetchDashboardData()
    } catch (error) {
      console.error('Failed to refresh platform:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">
            Monitor your content across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.location.href = '/platforms'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Platforms</p>
                <p className="text-2xl font-bold text-white">{stats.totalPlatforms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Content</p>
                <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">AI Adaptations</p>
                <p className="text-2xl font-bold text-white">{stats.unseenAdaptations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Est. Reach</p>
                <p className="text-2xl font-bold text-white">
                  {(stats.totalReach / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Grid */}
      {platforms.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No platforms connected
            </h3>
            <p className="text-slate-400 mb-4">
              Add your first platform to start monitoring content
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => window.location.href = '/platforms'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform: any) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              unseenCount={0} // TODO: Calculate from generated content
              onDelete={handleDeletePlatform}
              onRefresh={handleRefreshPlatform}
            />
          ))}
        </div>
      )}
    </div>
  )
}

