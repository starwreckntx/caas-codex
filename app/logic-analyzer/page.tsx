
'use client'

import { useState, useEffect } from 'react'
import { Brain, Plus, Play, Pause, RotateCcw, Settings, Users, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogicAnalyzerSession, PersonaAssignment, Model } from '@/lib/types'
import { LogicAnalyzerSessionForm } from '@/components/logic-analyzer-session-form'
import { PersonaAssignmentForm } from '@/components/persona-assignment-form'
import { EvaluationResults } from '@/components/evaluation-results'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function LogicAnalyzerPage() {
  const [sessions, setSessions] = useState<LogicAnalyzerSession[]>([])
  const [selectedSession, setSelectedSession] = useState<LogicAnalyzerSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false)
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [personas, setPersonas] = useState<any[]>([])

  useEffect(() => {
    fetchSessions()
    fetchModels()
    fetchPersonas()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/logic-analyzer/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data.filter((model: Model) => model.isActive))
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/logic-analyzer/personas')
      if (response.ok) {
        const data = await response.json()
        setPersonas(data)
      }
    } catch (error) {
      console.error('Error fetching personas:', error)
    }
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      const response = await fetch('/api/logic-analyzer/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        const newSession = await response.json()
        setSessions([newSession, ...sessions])
        setSelectedSession(newSession)
        setIsSessionFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      const response = await fetch('/api/logic-analyzer/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      })

      if (response.ok) {
        const newAssignment = await response.json()
        if (selectedSession) {
          const updatedSession = {
            ...selectedSession,
            assignments: [...(selectedSession.assignments || []), newAssignment]
          }
          setSelectedSession(updatedSession)
          setSessions(sessions.map(s => s.id === selectedSession.id ? updatedSession : s))
        }
        setIsAssignmentFormOpen(false)
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
  }

  const handleRunEvaluation = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/logic-analyzer/sessions/${sessionId}/evaluate`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh session data to get latest results
        const updatedResponse = await fetch(`/api/logic-analyzer/sessions/${sessionId}`)
        if (updatedResponse.ok) {
          const updatedSession = await updatedResponse.json()
          setSelectedSession(updatedSession)
          setSessions(sessions.map(s => s.id === sessionId ? updatedSession : s))
        }
      }
    } catch (error) {
      console.error('Error running evaluation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
          <div className="text-slate-400">Loading Logic Analyzer...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-purple-500" />
              Logic Analyzer
            </h1>
            <p className="text-slate-400 mt-2">
              Recursive persona-driven evaluation system for seed ideas and concepts
            </p>
          </div>
          
          <Dialog open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Analysis Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Create Analysis Session</DialogTitle>
              </DialogHeader>
              <LogicAnalyzerSessionForm
                onSubmit={handleCreateSession}
                onCancel={() => setIsSessionFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Analysis Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 mb-4">No analysis sessions yet</p>
                    <Button
                      onClick={() => setIsSessionFormOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedSession?.id === session.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-100 truncate">
                            {session.title}
                          </h3>
                          <Badge
                            variant={session.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {session.seedIdea}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                          <span>{session.assignments?.length || 0} personas</span>
                          <span>{session.results?.length || 0} results</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Session Header */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100">
                        {selectedSession.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRunEvaluation(selectedSession.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Run Evaluation
                        </Button>
                        <Dialog open={isAssignmentFormOpen} onOpenChange={setIsAssignmentFormOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-slate-700">
                              <Users className="w-4 h-4 mr-2" />
                              Assign Persona
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-slate-100">Assign Persona to Model</DialogTitle>
                            </DialogHeader>
                            <PersonaAssignmentForm
                              sessionId={selectedSession.id}
                              models={models}
                              personas={personas}
                              onSubmit={handleCreateAssignment}
                              onCancel={() => setIsAssignmentFormOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                          Seed Idea
                        </label>
                        <p className="text-slate-200 mt-1">
                          {selectedSession.seedIdea}
                        </p>
                      </div>
                      
                      {selectedSession.assignments && selectedSession.assignments.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                            Persona Assignments
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedSession.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="p-3 border border-slate-700 rounded-lg bg-slate-900/50"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-slate-200">
                                    {assignment.personaName}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {assignment.personaType}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-400">
                                  {assignment.model?.name || 'Unknown Model'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluation Results */}
                <EvaluationResults
                  session={selectedSession}
                  onRefresh={() => fetchSessions()}
                />
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12">
                  <div className="text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">
                      No Session Selected
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Select an analysis session from the list to view details and run evaluations
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
