
'use client'

import { useState, useEffect } from 'react'
import { Plus, Bot, Edit, Trash2, Settings, Search, Filter, Brain, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModelCard } from '@/components/model-card'
import { ModelForm } from '@/components/model-form'
import { Model } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateModel = async (modelData: any) => {
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      })

      if (response.ok) {
        const newModel = await response.json()
        setModels([newModel, ...models])
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating model:', error)
    }
  }

  const handleEditModel = async (modelData: any) => {
    if (!editingModel) return

    try {
      const response = await fetch(`/api/models/${editingModel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      })

      if (response.ok) {
        const updatedModel = await response.json()
        setModels(models.map(m => m.id === updatedModel.id ? updatedModel : m))
        setEditingModel(null)
        setIsFormOpen(false)
      }
    } catch (error) {
      console.error('Error updating model:', error)
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return

    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setModels(models.filter(m => m.id !== modelId))
      }
    } catch (error) {
      console.error('Error deleting model:', error)
    }
  }

  const handleEdit = (model: Model) => {
    setEditingModel(model)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingModel(null)
  }

  // Filter models based on search term, provider, and category
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.persona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.capabilities?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
    
    return matchesSearch && matchesProvider && matchesCategory
  })

  // Get unique providers and categories for filter dropdowns
  const providers = Array.from(new Set(models.map(m => m.provider).filter(Boolean))).sort()
  const categories = Array.from(new Set(models.map(m => m.category).filter(Boolean))).sort()

  // Group models by provider
  const modelsByProvider = providers.reduce((acc, provider) => {
    acc[provider] = filteredModels.filter(m => m.provider === provider)
    return acc
  }, {} as Record<string, Model[]>)

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <div className="text-slate-400">Loading frontier models...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-500" />
              Frontier AI Models
            </h1>
            <p className="text-slate-400 mt-2">
              Advanced AI models for recursive reasoning, chain-of-thought analysis, and logic evaluation
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                className="btn-primary"
                onClick={() => setEditingModel(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Model
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-100">
                  {editingModel ? 'Edit Model' : 'Create New Model'}
                </DialogTitle>
              </DialogHeader>
              <ModelForm
                model={editingModel}
                onSubmit={editingModel ? handleEditModel : handleCreateModel}
                onCancel={handleCloseForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search models, personas, or descriptions..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge variant="secondary" className="px-3 py-1 bg-slate-700 text-slate-300">
            {filteredModels.length} / {models.length} models
          </Badge>
        </div>

        {/* Models Grid */}
        {models.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Models Yet</h3>
            <p className="text-slate-500 mb-6">Create your first AI persona to get started</p>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="btn-primary"
                  onClick={() => setEditingModel(null)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Model
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Create New Model</DialogTitle>
                </DialogHeader>
                <ModelForm
                  onSubmit={handleCreateModel}
                  onCancel={handleCloseForm}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Models Found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="space-y-8">
            {providers.map(provider => {
              const providerModels = modelsByProvider[provider]
              if (!providerModels?.length) return null
              
              return (
                <div key={provider} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-200">
                      {provider}
                    </h2>
                    <Badge variant="outline" className="px-2 py-1 bg-slate-700 text-slate-300 border-slate-600">
                      {providerModels.length} models
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providerModels.map((model) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        onEdit={handleEdit}
                        onDelete={handleDeleteModel}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
