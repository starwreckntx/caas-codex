
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Model } from '@/lib/types'

interface ModelFormProps {
  model?: Model | null
  onSubmit: (data: any) => void
  onCancel: () => void
}

const BASE_MODELS = [
  // OpenAI Models
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1-Mini', provider: 'OpenAI' },
  
  // Anthropic Models
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic' },
  
  // Google Models
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash', provider: 'Google' },
  { value: 'gemini-1.5-pro-002', label: 'Gemini 1.5 Pro', provider: 'Google' },
  
  // Meta Models
  { value: 'llama-3.1-405b-instruct', label: 'Llama 3.1 405B', provider: 'Meta' },
  { value: 'llama-3.1-70b-instruct', label: 'Llama 3.1 70B', provider: 'Meta' },
  
  // Mistral AI Models
  { value: 'mistral-large-2407', label: 'Mistral Large', provider: 'Mistral AI' },
  { value: 'mixtral-8x7b-instruct', label: 'Mixtral 8x7B', provider: 'Mistral AI' },
  
  // Perplexity Models
  { value: 'pplx-70b-online', label: 'Perplexity 70B', provider: 'Perplexity' },
]

const PROVIDERS = [
  'OpenAI',
  'Anthropic', 
  'Google',
  'Meta',
  'Mistral AI',
  'Perplexity',
]

const CATEGORIES = [
  'reasoning',
  'creative',
  'technical',
  'coding',
  'analytical',
  'multimodal',
  'collaborative',
  'critical',
  'research',
  'educational',
  'strategic',
  'efficient',
  'specialist',
]

export function ModelForm({ model, onSubmit, onCancel }: ModelFormProps) {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    persona: model?.persona || '',
    baseModel: model?.baseModel || 'gpt-4o',
    provider: model?.provider || 'OpenAI',
    description: model?.description || '',
    capabilities: model?.capabilities || '',
    contextWindow: model?.contextWindow || 128000,
    category: model?.category || 'reasoning',
    isActive: model?.isActive ?? true,
    systemInstructions: model?.systemInstructions || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-populate provider when base model changes
  const handleBaseModelChange = (value: string) => {
    const selectedModel = BASE_MODELS.find(m => m.value === value)
    setFormData(prev => ({
      ...prev,
      baseModel: value,
      provider: selectedModel?.provider || prev.provider
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Model Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., GPT-4o Research Assistant"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Persona
            </label>
            <Input
              type="text"
              value={formData.persona}
              onChange={(e) => handleChange('persona', e.target.value)}
              placeholder="e.g., Advanced Academic Researcher"
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the model's purpose and key features..."
            className="textarea-field"
            rows={3}
            required
          />
        </div>
      </div>

      {/* Technical Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Technical Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Base Model
            </label>
            <Select value={formData.baseModel} onValueChange={handleBaseModelChange}>
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Select base model" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {BASE_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value} className="text-slate-100">
                    {model.label} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Provider
            </label>
            <Select value={formData.provider} onValueChange={(value) => handleChange('provider', value)}>
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider} value={provider} className="text-slate-100">
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Context Window (tokens)
            </label>
            <Input
              type="number"
              value={formData.contextWindow}
              onChange={(e) => handleChange('contextWindow', parseInt(e.target.value) || 0)}
              placeholder="e.g., 128000"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category} className="text-slate-100">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Capabilities
          </label>
          <Textarea
            value={formData.capabilities}
            onChange={(e) => handleChange('capabilities', e.target.value)}
            placeholder="List the model's key capabilities and strengths..."
            className="textarea-field"
            rows={3}
            required
          />
        </div>
      </div>

      {/* Behavior Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2">
          Behavior Configuration
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Active Status
            </label>
            <p className="text-xs text-slate-500">
              Enable this model for use in conversations
            </p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            System Instructions
          </label>
          <Textarea
            value={formData.systemInstructions}
            onChange={(e) => handleChange('systemInstructions', e.target.value)}
            placeholder="Define the AI's role, behavior, and personality in detail..."
            className="textarea-field"
            rows={6}
            required
          />
          <p className="text-xs text-slate-500 mt-2">
            These instructions define how the AI will behave and respond in conversations.
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="btn-primary flex-1">
          {model ? 'Update Model' : 'Create Model'}
        </Button>
        <Button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
