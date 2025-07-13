
'use client'

import { Edit, Trash2, Bot, Settings, Brain, Zap, Target, Database, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Model } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface ModelCardProps {
  model: Model
  onEdit: (model: Model) => void
  onDelete: (modelId: string) => void
}

const getProviderColor = (provider: string) => {
  const colors = {
    'OpenAI': 'bg-green-500',
    'Anthropic': 'bg-orange-500',
    'Google': 'bg-blue-500',
    'Meta': 'bg-purple-500',
    'Mistral AI': 'bg-indigo-500',
    'Perplexity': 'bg-pink-500',
  }
  return colors[provider as keyof typeof colors] || 'bg-gray-500'
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'reasoning': Brain,
    'creative': Zap,
    'technical': Settings,
    'coding': Database,
    'analytical': Target,
    'multimodal': Bot,
    'collaborative': CheckCircle,
    'critical': XCircle,
    'research': Brain,
    'educational': Target,
    'strategic': Target,
    'efficient': Zap,
    'specialist': Database,
  }
  return icons[category as keyof typeof icons] || Bot
}

export function ModelCard({ model, onEdit, onDelete }: ModelCardProps) {
  const CategoryIcon = getCategoryIcon(model.category || 'reasoning')
  const providerColor = getProviderColor(model.provider || 'OpenAI')
  
  return (
    <div className="content-card hover:shadow-lg transition-all duration-200 hover:shadow-blue-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${providerColor} rounded-lg flex items-center justify-center mr-3`}>
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{model.name}</h3>
            <p className="text-sm text-slate-400">{model.persona}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {model.isActive ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              Inactive
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(model)}
            className="text-slate-400 hover:text-slate-200"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(model.id)}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Description
          </label>
          <p className="text-sm text-slate-300 mt-1 line-clamp-2">
            {model.description || 'No description provided'}
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Capabilities
          </label>
          <p className="text-sm text-slate-300 mt-1 line-clamp-2">
            {model.capabilities || 'Standard AI capabilities'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Base Model
            </label>
            <p className="text-sm text-slate-300 mt-1">{model.baseModel}</p>
          </div>
          <div className="text-right">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Context Window
            </label>
            <p className="text-sm text-slate-300 mt-1">
              {model.contextWindow ? `${model.contextWindow?.toLocaleString()} tokens` : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {model.category || 'general'}
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              {model.provider || 'Unknown'}
            </Badge>
          </div>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}
