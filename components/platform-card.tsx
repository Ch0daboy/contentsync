import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  RefreshCw,
  Clock,
  FileText,
  Zap
} from "lucide-react"

interface PlatformCardProps {
  platform: {
    id: string
    name: string
    type: string
    url: string
    isActive: boolean
    lastChecked?: Date
    _count: {
      originalContent: number
    }
  }
  unseenCount: number
  onDelete: (id: string) => void
  onRefresh: (id: string) => void
}

export function PlatformCard({ 
  platform, 
  unseenCount, 
  onDelete, 
  onRefresh 
}: PlatformCardProps) {
  const getPlatformIcon = (type: string) => {
    // Return appropriate icon based on platform type
    switch (type) {
      case 'YOUTUBE':
        return '🎥'
      case 'BLOG_RSS':
        return '📝'
      case 'TWITTER':
        return '🐦'
      case 'INSTAGRAM':
        return '📸'
      case 'LINKEDIN':
        return '💼'
      default:
        return '🌐'
    }
  }

  const formatLastChecked = (date?: Date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-lg">
              {getPlatformIcon(platform.type)}
            </div>
            <div>
              <CardTitle className="text-white text-sm font-medium">
                {platform.name}
              </CardTitle>
              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                {platform.url}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {unseenCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {unseenCount} new
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <FileText className="h-3 w-3" />
            <span>{platform._count.originalContent} posts</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{formatLastChecked(platform.lastChecked)}</span>
          </div>
        </div>

        {unseenCount > 0 && (
          <div className="bg-slate-700/50 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">
                {unseenCount} AI adaptations ready
              </span>
              <Button size="sm" className="h-6 text-xs bg-purple-600 hover:bg-purple-700">
                <Zap className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-slate-600 text-slate-300 hover:text-white"
            onClick={() => onRefresh(platform.id)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:text-white"
            onClick={() => window.open(platform.url, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-red-400 hover:text-red-300"
            onClick={() => onDelete(platform.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}