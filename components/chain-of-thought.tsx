
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Brain, Lightbulb, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ChainOfThoughtProps {
  chainData?: any
  thoughtSteps?: string
  reasoningMeta?: any
  className?: string
}

export function ChainOfThought({ chainData, thoughtSteps, reasoningMeta, className }: ChainOfThoughtProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // If no chain of thought data, don't render anything
  if (!chainData && !thoughtSteps && !reasoningMeta) {
    return null
  }

  const hasContent = chainData || thoughtSteps || reasoningMeta

  const parseThoughtSteps = (steps: string) => {
    if (!steps) return []
    
    // Try to parse as JSON first
    try {
      return JSON.parse(steps)
    } catch {
      // If not JSON, split by lines and create simple steps
      return steps.split('\n').filter(line => line.trim()).map((line, index) => ({
        id: index,
        type: 'reasoning',
        content: line.trim(),
        timestamp: new Date().toISOString()
      }))
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'analysis':
        return <Brain className="w-4 h-4 text-blue-400" />
      case 'insight':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'decision':
        return <Target className="w-4 h-4 text-green-400" />
      case 'conclusion':
        return <CheckCircle className="w-4 h-4 text-purple-400" />
      default:
        return <Brain className="w-4 h-4 text-slate-400" />
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case 'analysis':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'insight':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'decision':
        return 'bg-green-500/10 border-green-500/20'
      case 'conclusion':
        return 'bg-purple-500/10 border-purple-500/20'
      default:
        return 'bg-slate-500/10 border-slate-500/20'
    }
  }

  const steps = thoughtSteps ? parseThoughtSteps(thoughtSteps) : []

  return (
    <div className={cn("w-full", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1 h-auto text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <Brain className="w-4 h-4" />
        <span className="text-sm">Chain of Thought</span>
        {hasContent && (
          <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs bg-slate-700 text-slate-300">
            {steps.length || 'Available'}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="mt-3 bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                {/* Thought Steps */}
                {steps.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Reasoning Process
                    </h4>
                    <div className="space-y-2">
                      {steps.map((step: any, index: number) => (
                        <div
                          key={step.id || index}
                          className={cn(
                            "p-3 rounded-lg border",
                            getStepColor(step.type || 'reasoning')
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {getStepIcon(step.type || 'reasoning')}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-300">
                                {step.content}
                              </div>
                              {step.type && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {step.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chain Data */}
                {chainData && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Processing Details</h4>
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg font-mono">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(chainData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Reasoning Metadata */}
                {reasoningMeta && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Reasoning Metadata</h4>
                    <div className="space-y-2">
                      {Object.entries(reasoningMeta).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-slate-300 font-mono">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
