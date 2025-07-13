
'use client'

import React from 'react'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Progress } from './progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { Button } from './button'
import { Alert, AlertDescription } from './alert'
import { TruthAssessment, DetectedIssue, TruthAlert } from '@/lib/types'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Clock,
  Brain,
  Target,
  Zap
} from 'lucide-react'

interface TruthReliabilityIndicatorProps {
  assessment?: TruthAssessment
  issues?: DetectedIssue[]
  alerts?: TruthAlert[]
  isExpanded?: boolean
  onToggle?: () => void
  showDetails?: boolean
}

export function TruthReliabilityIndicator({
  assessment,
  issues = [],
  alerts = [],
  isExpanded = false,
  onToggle,
  showDetails = true
}: TruthReliabilityIndicatorProps) {
  if (!assessment) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded-lg">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">Truth checking pending...</span>
      </div>
    )
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    if (score >= 0.4) return 'text-orange-400'
    return 'text-red-400'
  }

  const getReliabilityBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-900/30 text-green-400'
    if (score >= 0.6) return 'bg-yellow-900/30 text-yellow-400'
    if (score >= 0.4) return 'bg-orange-900/30 text-orange-400'
    return 'bg-red-900/30 text-red-400'
  }

  const getReliabilityIcon = (score: number) => {
    if (score >= 0.8) return <ShieldCheck className="w-4 h-4" />
    if (score >= 0.6) return <Shield className="w-4 h-4" />
    if (score >= 0.4) return <ShieldAlert className="w-4 h-4" />
    return <ShieldX className="w-4 h-4" />
  }

  const getReliabilityLabel = (score: number) => {
    if (score >= 0.8) return 'Highly Reliable'
    if (score >= 0.6) return 'Moderately Reliable'
    if (score >= 0.4) return 'Low Reliability'
    return 'Unreliable'
  }

  const criticalAlerts = alerts.filter(alert => alert.severityLevel === 'CRITICAL')
  const highAlerts = alerts.filter(alert => alert.severityLevel === 'HIGH')
  const unresolvedIssues = issues.filter(issue => !issue.isResolved)

  return (
    <div className="space-y-2">
      {/* Main Indicator */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={getReliabilityColor(assessment.overallScore)}>
            {getReliabilityIcon(assessment.overallScore)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-200">
                {getReliabilityLabel(assessment.overallScore)}
              </span>
              <Badge className={getReliabilityBadgeColor(assessment.overallScore)}>
                {(assessment.overallScore * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Checked {new Date(assessment.checkedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Alert Indicators */}
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {highAlerts.length > 0 && (
            <Badge className="bg-orange-100 text-orange-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {highAlerts.length} High
            </Badge>
          )}
          {unresolvedIssues.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Eye className="w-3 h-3 mr-1" />
              {unresolvedIssues.length} Issues
            </Badge>
          )}

          {/* Toggle Button */}
          {showDetails && onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Detailed Assessment Panel */}
      {showDetails && (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
          <CollapsibleContent>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Truth Reliability Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reliability Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Overall</span>
                    </div>
                    <Progress value={assessment.overallScore * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {(assessment.overallScore * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <Progress value={assessment.accuracyScore * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {(assessment.accuracyScore * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Reliability</span>
                    </div>
                    <Progress value={assessment.reliabilityScore * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {(assessment.reliabilityScore * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Consistency</span>
                    </div>
                    <Progress value={assessment.consistencyScore * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {(assessment.consistencyScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-700">{assessment.analysisContent}</p>
                </div>

                {/* Detected Issues */}
                {unresolvedIssues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Detected Issues ({unresolvedIssues.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {unresolvedIssues.map((issue) => (
                        <Alert key={issue.id} className="border-l-4 border-l-orange-500">
                          <AlertDescription>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    issue.severityLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                    issue.severityLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                    issue.severityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }>
                                    {issue.severityLevel}
                                  </Badge>
                                  <span className="font-medium">{issue.title}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                {issue.textLocation && (
                                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                    <strong>Location:</strong> "{issue.textLocation}"
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(issue.confidence * 100).toFixed(0)}% confidence
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Alerts */}
                {alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Active Alerts ({alerts.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {alerts.map((alert) => (
                        <Alert key={alert.id} className={`border-l-4 ${
                          alert.severityLevel === 'CRITICAL' ? 'border-l-red-500' :
                          alert.severityLevel === 'HIGH' ? 'border-l-orange-500' :
                          alert.severityLevel === 'MEDIUM' ? 'border-l-yellow-500' :
                          'border-l-blue-500'
                        }`}>
                          <AlertDescription>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    alert.severityLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                    alert.severityLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                    alert.severityLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }>
                                    {alert.severityLevel}
                                  </Badge>
                                  <span className="font-medium">{alert.title}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                {alert.isActionRequired && (
                                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                                    <strong>Action Required:</strong> This alert requires immediate attention
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(alert.triggeredAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Methodology */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <strong>Methodology:</strong> {assessment.methodology}
                  <br />
                  <strong>Confidence Level:</strong> {(assessment.confidenceLevel * 100).toFixed(1)}%
                  {assessment.processingTime && (
                    <>
                      <br />
                      <strong>Processing Time:</strong> {assessment.processingTime}ms
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
