
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreateLogicAnalyzerSessionForm } from '@/lib/types'

interface LogicAnalyzerSessionFormProps {
  onSubmit: (data: CreateLogicAnalyzerSessionForm) => void
  onCancel: () => void
}

export function LogicAnalyzerSessionForm({ onSubmit, onCancel }: LogicAnalyzerSessionFormProps) {
  const [formData, setFormData] = useState<CreateLogicAnalyzerSessionForm>({
    title: '',
    seedIdea: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.seedIdea.trim()) {
      newErrors.seedIdea = 'Seed idea is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSubmit(formData)
  }

  const handleChange = (field: keyof CreateLogicAnalyzerSessionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Session Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter analysis session title"
            className="bg-slate-800 border-slate-700"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="seedIdea">Seed Idea</Label>
          <Textarea
            id="seedIdea"
            value={formData.seedIdea}
            onChange={(e) => handleChange('seedIdea', e.target.value)}
            placeholder="Enter the seed idea or concept to analyze..."
            rows={4}
            className="bg-slate-800 border-slate-700"
          />
          {errors.seedIdea && (
            <p className="text-red-400 text-sm mt-1">{errors.seedIdea}</p>
          )}
          <p className="text-slate-400 text-sm mt-1">
            This is the core concept that will be evaluated through recursive persona analysis.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
          Create Session
        </Button>
      </div>
    </form>
  )
}
