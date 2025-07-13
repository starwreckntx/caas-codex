
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Brain, RotateCcw, Download, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogicAnalyzerSession } from '@/lib/types'
import { ChainOfThought } from './chain-of-thought'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface EvaluationResultsProps {
  session: LogicAnalyzerSession
  onRefresh: () => void
}

export function EvaluationResults({ session, onRefresh }: EvaluationResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({})

  const toggleResult = (resultId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }))
  }

  const getPersonaTypeColor = (type: string) => {
    switch (type) {
      case 'CREATIVE':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/20'
      case 'NOVELTY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/20'
      case 'EDGE_CASE':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/20'
      case 'RECURSIVE_LOGIC':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/20'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/20'
    }
  }

  const groupedResults = session.results?.reduce((acc, result) => {
    const loop = result.loopNumber
    if (!acc[loop]) {
      acc[loop] = []
    }
    acc[loop].push(result)
    return acc
  }, {} as Record<number, any[]>) || {}

  const sortedLoops = Object.keys(groupedResults).sort((a, b) => parseInt(a) - parseInt(b))

  if (!session.results || session.results.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-green-500" />
            Evaluation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RotateCcw className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">No evaluation results yet</p>
            <p className="text-slate-500 text-sm">
              Assign personas to models and run an evaluation to see results
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-green-500" />
            Evaluation Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-700">
              {session.results.length} responses
            </Badge>
            <Badge variant="secondary" className="bg-slate-700">
              {sortedLoops.length} loops
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="border-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedLoops.map((loopNum) => (
            <div key={loopNum} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-200">
                  Loop {loopNum}
                </h3>
                <Badge variant="outline" className="border-slate-600">
                  {groupedResults[parseInt(loopNum)].length} responses
                </Badge>
              </div>
              
              <div className="space-y-4">
                {groupedResults[parseInt(loopNum)].map((result) => (
                  <div key={result.id} className="border border-slate-700 rounded-lg">
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                      onClick={() => toggleResult(result.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedResults[result.id] ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200">
                              {result.assignment?.personaName || 'Unknown Persona'}
                            </span>
                            <Badge className={getPersonaTypeColor(result.assignment?.personaType)}>
                              {result.assignment?.personaType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-400">
                          {result.assignment?.model?.name || 'Unknown Model'}
                        </span>
                        {result.score && (
                          <Badge variant="secondary" className="bg-slate-700">
                            Score: {result.score.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedResults[result.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-700 p-4">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                  Response
                                </label>
                                <div className="mt-2 text-slate-200 leading-relaxed">
                                  {result.response}
                                </div>
                              </div>
                              
                              {result.chainOfThought && (
                                <div className="border-t border-slate-700 pt-4">
                                  <ChainOfThought
                                    chainData={result.chainOfThought}
                                    reasoningMeta={result.metadata}
                                  />
                                </div>
                              )}
                              
                              {result.metadata && (
                                <div className="border-t border-slate-700 pt-4">
                                  <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                    Metadata
                                  </label>
                                  <div className="mt-2 text-xs text-slate-400 bg-slate-900 p-3 rounded font-mono">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(result.metadata, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
