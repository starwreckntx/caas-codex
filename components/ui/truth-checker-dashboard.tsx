
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { TruthAssessment, TruthAlert, DetectedIssue } from '@/lib/types'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  Target,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react'

interface TruthCheckerDashboardProps {
  conversationId: string
  assessments: TruthAssessment[]
  alerts: TruthAlert[]
  issues: DetectedIssue[]
  onToggleSettings?: () => void
  onRefresh?: () => void
}

export function TruthCheckerDashboard({
  conversationId,
  assessments,
  alerts,
  issues,
  onToggleSettings,
  onRefresh
}: TruthCheckerDashboardProps) {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    reliabilityTrend: 0,
    criticalAlerts: 0,
    unresolvedIssues: 0,
    processingTime: 0
  })

  useEffect(() => {
    calculateStats()
  }, [assessments, alerts, issues])

  const calculateStats = () => {
    const totalAssessments = assessments.length
    const averageScore = totalAssessments > 0 
      ? assessments.reduce((sum, a) => sum + a.overallScore, 0) / totalAssessments 
      : 0
    
    // Calculate trend (last 5 vs previous 5)
    const recent = assessments.slice(-5)
    const previous = assessments.slice(-10, -5)
    const recentAvg = recent.length > 0 ? recent.reduce((sum, a) => sum + a.overallScore, 0) / recent.length : 0
    const previousAvg = previous.length > 0 ? previous.reduce((sum, a) => sum + a.overallScore, 0) / previous.length : 0
    const reliabilityTrend = recentAvg - previousAvg

    const criticalAlerts = alerts.filter(a => a.severityLevel === 'CRITICAL' && !a.isDismissed).length
    const unresolvedIssues = issues.filter(i => !i.isResolved).length
    const processingTime = totalAssessments > 0 
      ? assessments.reduce((sum, a) => sum + (a.processingTime || 0), 0) / totalAssessments 
      : 0

    setStats({
      totalAssessments,
      averageScore,
      reliabilityTrend,
      criticalAlerts,
      unresolvedIssues,
      processingTime
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    if (score >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < -0.05) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  const getRecentAssessments = () => {
    return assessments.slice(-5).reverse()
  }

  const getIssueTypeDistribution = () => {
    const distribution: Record<string, number> = {}
    issues.forEach(issue => {
      const type = issue.issueType.replace(/_/g, ' ')
      distribution[type] = (distribution[type] || 0) + 1
    })
    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Truth Reliability Dashboard</h2>
          <p className="text-gray-600">Monitor conversation truth and reliability metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {(stats.averageScore * 100).toFixed(1)}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={stats.averageScore * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reliability Trend</p>
                <p className={`text-2xl font-bold ${stats.reliabilityTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.reliabilityTrend >= 0 ? '+' : ''}{(stats.reliabilityTrend * 100).toFixed(1)}%
                </p>
              </div>
              {getTrendIcon(stats.reliabilityTrend)}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              vs previous assessment period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className={`text-2xl font-bold ${stats.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.criticalAlerts}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Requiring immediate attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved Issues</p>
                <p className={`text-2xl font-bold ${stats.unresolvedIssues > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {stats.unresolvedIssues}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Detected but not resolved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments and Issue Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>Recent Assessments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentAssessments().map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        assessment.overallScore >= 0.8 ? 'bg-green-100 text-green-800' :
                        assessment.overallScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        assessment.overallScore >= 0.4 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {(assessment.overallScore * 100).toFixed(1)}%
                      </Badge>
                      <span className="text-sm font-medium">
                        {assessment.assessmentType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(assessment.checkedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{(assessment.accuracyScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
              {getRecentAssessments().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No assessments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issue Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-500" />
              <span>Issue Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getIssueTypeDistribution().map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium capitalize">{type}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / issues.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {count}
                  </Badge>
                </div>
              ))}
              {getIssueTypeDistribution().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No issues detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Assessments</span>
                <span className="text-sm text-gray-600">{stats.totalAssessments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Processing Time</span>
                <span className="text-sm text-gray-600">{stats.processingTime.toFixed(0)}ms</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Priority Alerts</span>
                <span className="text-sm text-gray-600">
                  {alerts.filter(a => a.severityLevel === 'HIGH' && !a.isDismissed).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Action Required</span>
                <span className="text-sm text-gray-600">
                  {alerts.filter(a => a.isActionRequired && !a.isDismissed).length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-gray-600">
                  {stats.totalAssessments > 0 ? ((stats.totalAssessments - alerts.filter(a => a.severityLevel === 'CRITICAL').length) / stats.totalAssessments * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Confidence</span>
                <span className="text-sm text-gray-600">
                  {assessments.length > 0 ? (assessments.reduce((sum, a) => sum + a.confidenceLevel, 0) / assessments.length * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
