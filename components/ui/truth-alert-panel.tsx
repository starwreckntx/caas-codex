
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Alert, AlertDescription } from './alert'
import { TruthAlert, SeverityLevel } from '@/lib/types'
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff,
  Clock,
  Filter,
  AlertCircle
} from 'lucide-react'

interface TruthAlertPanelProps {
  alerts: TruthAlert[]
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  onFilter?: (filter: AlertFilter) => void
  showFilters?: boolean
}

interface AlertFilter {
  severityLevel?: SeverityLevel
  acknowledged?: boolean
  dismissed?: boolean
  actionRequired?: boolean
}

export function TruthAlertPanel({
  alerts,
  onAcknowledge,
  onDismiss,
  onFilter,
  showFilters = true
}: TruthAlertPanelProps) {
  const [filter, setFilter] = useState<AlertFilter>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="w-4 h-4 text-red-500" />
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'LOW': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'DECEPTION_DETECTED': return <XCircle className="w-4 h-4" />
      case 'HALLUCINATION_ALERT': return <AlertTriangle className="w-4 h-4" />
      case 'ACCURACY_WARNING': return <AlertCircle className="w-4 h-4" />
      case 'RELIABILITY_ALERT': return <Info className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter.severityLevel && alert.severityLevel !== filter.severityLevel) return false
    if (filter.acknowledged !== undefined && alert.isAcknowledged !== filter.acknowledged) return false
    if (filter.dismissed !== undefined && alert.isDismissed !== filter.dismissed) return false
    if (filter.actionRequired !== undefined && alert.isActionRequired !== filter.actionRequired) return false
    return true
  })

  const handleFilterChange = (newFilter: AlertFilter) => {
    setFilter(newFilter)
    onFilter?.(newFilter)
  }

  const criticalCount = alerts.filter(a => a.severityLevel === 'CRITICAL' && !a.isDismissed).length
  const highCount = alerts.filter(a => a.severityLevel === 'HIGH' && !a.isDismissed).length
  const unacknowledgedCount = alerts.filter(a => !a.isAcknowledged && !a.isDismissed).length

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No Truth Alerts</p>
            <p className="text-sm text-gray-500">All messages have passed truth verification</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Truth Alerts ({alerts.length})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {highCount} High
              </Badge>
            )}
            {unacknowledgedCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                {unacknowledgedCount} Unacknowledged
              </Badge>
            )}
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Panel */}
        {showFilters && isFilterOpen && (
          <Card className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium">Filter Alerts</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <select
                    value={filter.severityLevel || ''}
                    onChange={(e) => handleFilterChange({
                      ...filter,
                      severityLevel: e.target.value as SeverityLevel || undefined
                    })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filter.acknowledged === undefined ? '' : filter.acknowledged.toString()}
                    onChange={(e) => handleFilterChange({
                      ...filter,
                      acknowledged: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="false">Unacknowledged</option>
                    <option value="true">Acknowledged</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Action Required</label>
                  <select
                    value={filter.actionRequired === undefined ? '' : filter.actionRequired.toString()}
                    onChange={(e) => handleFilterChange({
                      ...filter,
                      actionRequired: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All</option>
                    <option value="true">Action Required</option>
                    <option value="false">No Action</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange({})}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Alert List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.severityLevel === 'CRITICAL' ? 'border-l-red-500' :
              alert.severityLevel === 'HIGH' ? 'border-l-orange-500' :
              alert.severityLevel === 'MEDIUM' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            } ${alert.isDismissed ? 'opacity-50' : ''}`}>
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSeverityIcon(alert.severityLevel)}
                      <Badge className={getSeverityColor(alert.severityLevel)}>
                        {alert.severityLevel}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                      {alert.isActionRequired && (
                        <Badge className="bg-red-100 text-red-800">
                          Action Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.triggeredAt).toLocaleString()}</span>
                      </div>
                      <div>
                        Threshold: {(alert.triggerThreshold * 100).toFixed(1)}%
                      </div>
                      <div>
                        Actual: {(alert.actualValue * 100).toFixed(1)}%
                      </div>
                    </div>
                    {alert.isAcknowledged && (
                      <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Acknowledged</span>
                        {alert.acknowledgedAt && (
                          <span>on {new Date(alert.acknowledgedAt).toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.isAcknowledged && onAcknowledge && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAcknowledge(alert.id)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {!alert.isDismissed && onDismiss && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDismiss(alert.id)}
                        className="text-xs"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No alerts match the current filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
