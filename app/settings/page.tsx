"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, Zap, Palette, Globe, Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    profile: {
      name: "Sarah Chen",
      email: "sarah@techwithsarah.com",
      bio: "Tech content creator passionate about web development, React, and helping developers grow their skills.",
      website: "https://techwithsarah.com",
    },
    notifications: {
      contentReady: true,
      syncComplete: true,
      gapsDetected: true,
      weeklyReport: true,
      emailNotifications: true,
    },
    automation: {
      autoApprove: false,
      autoSchedule: true,
      smartTiming: true,
      crossPlatformOptimization: true,
    },
    ai: {
      creativityLevel: 7,
      voiceConsistency: 9,
      contentLength: "medium",
      includeEmojis: true,
      includeHashtags: true,
    },
  })

  const handleSave = () => {
    console.log("Saving settings:", settings)
    // Here you would typically make an API call to save settings
  }

  const handleReset = () => {
    console.log("Resetting to defaults")
    // Reset to default settings
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Customize your ContentSync experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="border-slate-600 text-slate-300 bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-white">Profile Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, name: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, email: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-slate-300">
                Website
              </Label>
              <Input
                id="website"
                value={settings.profile.website}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, website: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-slate-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={settings.profile.bio}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value },
                  })
                }
                className="bg-slate-700 border-slate-600 text-white mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Content Ready for Review</Label>
                <p className="text-sm text-slate-400">Get notified when AI-generated content is ready</p>
              </div>
              <Switch
                checked={settings.notifications.contentReady}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, contentReady: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Sync Complete</Label>
                <p className="text-sm text-slate-400">Platform synchronization finished</p>
              </div>
              <Switch
                checked={settings.notifications.syncComplete}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, syncComplete: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Content Gaps Detected</Label>
                <p className="text-sm text-slate-400">New content gaps identified</p>
              </div>
              <Switch
                checked={settings.notifications.gapsDetected}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, gapsDetected: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Weekly Reports</Label>
                <p className="text-sm text-slate-400">Performance summary every week</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, weeklyReport: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Email Notifications</Label>
                <p className="text-sm text-slate-400">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-white">Automation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Auto-Approve Content</Label>
                <p className="text-sm text-slate-400">Automatically approve high-confidence content</p>
              </div>
              <Switch
                checked={settings.automation.autoApprove}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    automation: { ...settings.automation, autoApprove: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Auto-Schedule</Label>
                <p className="text-sm text-slate-400">Automatically schedule approved content</p>
              </div>
              <Switch
                checked={settings.automation.autoSchedule}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    automation: { ...settings.automation, autoSchedule: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Smart Timing</Label>
                <p className="text-sm text-slate-400">Optimize posting times for each platform</p>
              </div>
              <Switch
                checked={settings.automation.smartTiming}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    automation: { ...settings.automation, smartTiming: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Cross-Platform Optimization</Label>
                <p className="text-sm text-slate-400">Automatically optimize content for each platform</p>
              </div>
              <Switch
                checked={settings.automation.crossPlatformOptimization}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    automation: { ...settings.automation, crossPlatformOptimization: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-green-500" />
              <CardTitle className="text-white">AI Content Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Creativity Level</Label>
              <p className="text-sm text-slate-400 mb-2">How creative should the AI be? (1-10)</p>
              <Input
                type="range"
                min="1"
                max="10"
                value={settings.ai.creativityLevel}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, creativityLevel: Number.parseInt(e.target.value) },
                  })
                }
                className="bg-slate-700 border-slate-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Conservative</span>
                <span className="text-white font-semibold">{settings.ai.creativityLevel}</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Voice Consistency</Label>
              <p className="text-sm text-slate-400 mb-2">How closely should AI match your voice? (1-10)</p>
              <Input
                type="range"
                min="1"
                max="10"
                value={settings.ai.voiceConsistency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, voiceConsistency: Number.parseInt(e.target.value) },
                  })
                }
                className="bg-slate-700 border-slate-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Flexible</span>
                <span className="text-white font-semibold">{settings.ai.voiceConsistency}</span>
                <span>Exact Match</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Include Emojis</Label>
                <p className="text-sm text-slate-400">Add emojis to social media content</p>
              </div>
              <Switch
                checked={settings.ai.includeEmojis}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, includeEmojis: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Include Hashtags</Label>
                <p className="text-sm text-slate-400">Add relevant hashtags to posts</p>
              </div>
              <Switch
                checked={settings.ai.includeHashtags}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, includeHashtags: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creator Profile Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-white">Creator Profile Analysis</CardTitle>
          </div>
          <p className="text-slate-400">AI analysis of your unique content style and voice</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Content Themes</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Web Development</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">React/JavaScript</span>
                  <span className="text-white">72%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Career Advice</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tutorials</span>
                  <span className="text-white">68%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Writing Style</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tone</span>
                  <span className="text-white">Friendly & Professional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Complexity</span>
                  <span className="text-white">Intermediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Length</span>
                  <span className="text-white">Medium-form</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Engagement</span>
                  <span className="text-white">Question-driven</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Platform Preferences</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">YouTube</span>
                  <span className="text-white">Long-form tutorials</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Twitter</span>
                  <span className="text-white">Quick tips & threads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blog</span>
                  <span className="text-white">In-depth guides</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LinkedIn</span>
                  <span className="text-white">Career insights</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
