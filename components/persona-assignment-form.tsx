
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CreatePersonaAssignmentForm, Model, PersonaType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface PersonaAssignmentFormProps {
  sessionId: string
  models: Model[]
  personas: any[]
  onSubmit: (data: CreatePersonaAssignmentForm) => void
  onCancel: () => void
}

export function PersonaAssignmentForm({ 
  sessionId, 
  models, 
  personas, 
  onSubmit, 
  onCancel 
}: PersonaAssignmentFormProps) {
  const [formData, setFormData] = useState<CreatePersonaAssignmentForm>({
    sessionId,
    modelId: '',
    personaName: '',
    personaType: 'CUSTOM',
    personaData: {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPersona, setSelectedPersona] = useState<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.modelId) {
      newErrors.modelId = 'Model is required'
    }
    
    if (!formData.personaName.trim()) {
      newErrors.personaName = 'Persona name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const submissionData = {
      ...formData,
      personaData: selectedPersona ? {
        description: selectedPersona.description,
        instructions: selectedPersona.instructions,
        type: selectedPersona.type
      } : formData.personaData
    }
    
    onSubmit(submissionData)
  }

  const handlePersonaSelect = (personaName: string) => {
    const persona = personas.find(p => p.name === personaName)
    setSelectedPersona(persona)
    setFormData(prev => ({
      ...prev,
      personaName,
      personaType: persona?.type || 'CUSTOM'
    }))
    if (errors.personaName) {
      setErrors(prev => ({ ...prev, personaName: '' }))
    }
  }

  const handleModelSelect = (modelId: string) => {
    setFormData(prev => ({ ...prev, modelId }))
    if (errors.modelId) {
      setErrors(prev => ({ ...prev, modelId: '' }))
    }
  }

  const getPersonaTypeColor = (type: string) => {
    switch (type) {
      case 'CREATIVE':
        return 'bg-pink-500/20 text-pink-300'
      case 'NOVELTY':
        return 'bg-blue-500/20 text-blue-300'
      case 'EDGE_CASE':
        return 'bg-orange-500/20 text-orange-300'
      case 'RECURSIVE_LOGIC':
        return 'bg-purple-500/20 text-purple-300'
      default:
        return 'bg-slate-500/20 text-slate-300'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="persona">Persona</Label>
          <Select value={formData.personaName} onValueChange={handlePersonaSelect}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue placeholder="Select a persona" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {personas.map((persona) => (
                <SelectItem key={persona.name} value={persona.name}>
                  <div className="flex items-center justify-between w-full">
                    <span>{persona.name}</span>
                    <Badge className={`ml-2 ${getPersonaTypeColor(persona.type)}`}>
                      {persona.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.personaName && (
            <p className="text-red-400 text-sm mt-1">{errors.personaName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="model">Model</Label>
          <Select value={formData.modelId} onValueChange={handleModelSelect}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{model.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {model.provider}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.modelId && (
            <p className="text-red-400 text-sm mt-1">{errors.modelId}</p>
          )}
        </div>

        {selectedPersona && (
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
            <h4 className="font-medium text-slate-200 mb-2">
              {selectedPersona.name}
            </h4>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getPersonaTypeColor(selectedPersona.type)}>
                {selectedPersona.type}
              </Badge>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              {selectedPersona.description}
            </p>
            <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded font-mono">
              {selectedPersona.instructions}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
          <Textarea
            id="customInstructions"
            value={formData.personaData?.customInstructions || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personaData: {
                ...prev.personaData,
                customInstructions: e.target.value
              }
            }))}
            placeholder="Add any custom instructions for this persona assignment..."
            rows={3}
            className="bg-slate-800 border-slate-700"
          />
          <p className="text-slate-400 text-sm mt-1">
            Additional instructions will be combined with the persona's base instructions.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
          Assign Persona
        </Button>
      </div>
    </form>
  )
}
