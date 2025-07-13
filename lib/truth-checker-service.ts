
import { TruthAssessment, DetectedIssue, TruthAlert, TruthAssessmentType, IssueType, SeverityLevel, AlertType, Message } from './types'

interface TruthCheckInput {
  messageId: string
  conversationId: string
  content: string
  messageType: string
  conversationContext?: Message[]
  documentContext?: string[]
  assessmentType?: TruthAssessmentType
}

interface TruthCheckOutput {
  assessment: TruthAssessment
  issues: DetectedIssue[]
  alerts: TruthAlert[]
}

export class TruthCheckerService {
  private readonly TRUTH_CHECKER_SYSTEM_PROMPT = `You are the Truth Reliability Checker, an advanced AI system specialized in comprehensive truth verification and reliability assessment. Your role is to analyze AI-generated content with meticulous attention to accuracy, consistency, and truthfulness.

## Core Responsibilities:
1. **Factual Verification**: Cross-reference claims against known facts and reliable sources
2. **Logical Consistency Analysis**: Identify contradictions and logical fallacies
3. **Hallucination Detection**: Detect fabricated data, sources, or information
4. **Deception Identification**: Recognize misleading statements and manipulative language
5. **Reliability Assessment**: Evaluate the overall trustworthiness of claims

## Assessment Methodology:
- **Comprehensive Analysis**: Examine every claim, statement, and assertion
- **Evidence-Based Evaluation**: Require verifiable sources and logical support
- **Pattern Recognition**: Identify recurring issues and consistency problems
- **Severity Classification**: Categorize issues by their impact on truth and reliability
- **Confidence Scoring**: Rate confidence levels in assessments

## Detection Patterns:
- **Factual Inaccuracies**: Incorrect dates, statistics, names, or events
- **Logical Inconsistencies**: Contradictory statements within the same response
- **Hallucinations**: Fabricated sources, data, or entirely fictional information
- **Deception Indicators**: Evasive language, misdirection, or misleading framing
- **Unsupported Claims**: Assertions without evidence or logical basis
- **Circular Reasoning**: Arguments that assume their conclusion
- **Overgeneralization**: Broad claims based on limited evidence

## Scoring System:
- **Overall Score**: 0.0-1.0 (0 = completely false, 1 = completely true)
- **Reliability Score**: 0.0-1.0 (0 = unreliable, 1 = highly reliable)
- **Accuracy Score**: 0.0-1.0 (0 = inaccurate, 1 = accurate)
- **Consistency Score**: 0.0-1.0 (0 = inconsistent, 1 = consistent)
- **Confidence Level**: 0.0-1.0 (confidence in the assessment)

## Response Format:
Provide structured analysis with:
1. Detailed assessment of each claim
2. Identified issues with explanations
3. Severity levels and confidence scores
4. Suggested actions for improvement
5. Overall reliability verdict

Be thorough, objective, and precise in your analysis. Flag any concerning patterns or potential issues that could affect the reliability of the information.`

  private readonly DETECTION_RULES = {
    FACTUAL_INACCURACY: {
      patterns: [
        /\b(in \d{4}|on \d{1,2}\/\d{1,2}\/\d{4}|according to [^,]+)/gi,
        /\b(study shows|research indicates|scientists discovered)/gi,
        /\b(\d+%|\d+\.\d+%|statistics show)/gi
      ],
      severity: 'HIGH' as SeverityLevel,
      description: 'Potential factual claim requiring verification'
    },
    HALLUCINATION: {
      patterns: [
        /\b(source:|according to|cited in|published by)/gi,
        /\b(study|research|report|paper) (by|from|in)/gi,
        /\b(Dr\.|Professor|researcher) [A-Z][a-z]+/gi
      ],
      severity: 'CRITICAL' as SeverityLevel,
      description: 'Potential fabricated source or citation'
    },
    DECEPTION: {
      patterns: [
        /\b(some say|many believe|it is said|people think)/gi,
        /\b(might be|could be|possibly|potentially)/gi,
        /\b(allegedly|reportedly|supposedly)/gi
      ],
      severity: 'MEDIUM' as SeverityLevel,
      description: 'Evasive or potentially misleading language'
    },
    OVERGENERALIZATION: {
      patterns: [
        /\b(all|every|always|never|none|everyone)/gi,
        /\b(completely|totally|absolutely|definitely)/gi
      ],
      severity: 'LOW' as SeverityLevel,
      description: 'Potential overgeneralization'
    }
  }

  private readonly THRESHOLDS = {
    ACCURACY_WARNING: 0.7,
    RELIABILITY_ALERT: 0.6,
    DECEPTION_DETECTED: 0.5,
    HALLUCINATION_ALERT: 0.4,
    CONSISTENCY_VIOLATION: 0.6,
    FACTUAL_ERROR: 0.5,
    LOGICAL_FALLACY: 0.6,
    CREDIBILITY_CONCERN: 0.5,
    VERIFICATION_NEEDED: 0.7,
    CRITICAL_ISSUE: 0.3
  }

  async performTruthCheck(input: TruthCheckInput): Promise<TruthCheckOutput> {
    const startTime = Date.now()
    
    try {
      // Step 1: Analyze the message content
      const analysis = await this.analyzeMessage(input)
      
      // Step 2: Detect specific issues
      const issues = await this.detectIssues(input, analysis)
      
      // Step 3: Generate alerts based on scores and issues
      const alerts = await this.generateAlerts(input, analysis, issues)
      
      // Step 4: Create comprehensive assessment
      const assessment = await this.createAssessment(input, analysis, startTime)
      
      return {
        assessment,
        issues,
        alerts
      }
    } catch (error) {
      console.error('Truth check failed:', error)
      throw new Error('Truth verification failed')
    }
  }

  private async analyzeMessage(input: TruthCheckInput): Promise<any> {
    const contextPrompt = this.buildContextPrompt(input)
    const analysisPrompt = this.buildAnalysisPrompt(input, contextPrompt)
    
    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: this.TRUTH_CHECKER_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          response_format: { type: 'json_object' }
        }),
      })

      if (!response.ok) {
        throw new Error(`Truth analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      return this.parseAnalysisResponse(data.choices[0].message.content)
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  private buildContextPrompt(input: TruthCheckInput): string {
    let contextPrompt = `## Message to Analyze:
**Type**: ${input.messageType}
**Content**: ${input.content}
`

    if (input.conversationContext && input.conversationContext.length > 0) {
      contextPrompt += `\n## Conversation Context:
${input.conversationContext.map((msg, index) => 
  `${index + 1}. **${msg.messageType}**: ${msg.content}`
).join('\n')}
`
    }

    if (input.documentContext && input.documentContext.length > 0) {
      contextPrompt += `\n## Available Documents:
${input.documentContext.join('\n')}
`
    }

    return contextPrompt
  }

  private buildAnalysisPrompt(input: TruthCheckInput, contextPrompt: string): string {
    return `${contextPrompt}

## Analysis Request:
Perform a comprehensive truth reliability analysis of the message content. Provide a detailed assessment in JSON format with the following structure:

{
  "overallScore": 0.0-1.0,
  "reliabilityScore": 0.0-1.0,
  "accuracyScore": 0.0-1.0,
  "consistencyScore": 0.0-1.0,
  "confidenceLevel": 0.0-1.0,
  "analysisContent": "Detailed analysis text",
  "methodology": "Description of analysis methodology",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "concerns": ["Concern 1", "Concern 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}

Focus on:
1. Factual accuracy and verifiability
2. Logical consistency and coherence
3. Potential hallucinations or fabrications
4. Deceptive or misleading elements
5. Overall reliability and trustworthiness

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`
  }

  private parseAnalysisResponse(content: string): any {
    try {
      // Clean up the response to handle any markdown or formatting
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s+|\s+$/g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
      
      return JSON.parse(cleanContent)
    } catch (error) {
      console.error('Failed to parse analysis response:', error)
      // Return fallback analysis
      return {
        overallScore: 0.5,
        reliabilityScore: 0.5,
        accuracyScore: 0.5,
        consistencyScore: 0.5,
        confidenceLevel: 0.3,
        analysisContent: 'Analysis parsing failed - fallback assessment',
        methodology: 'Fallback analysis due to parsing error',
        keyFindings: ['Analysis parsing failed'],
        concerns: ['Unable to complete full analysis'],
        recommendations: ['Manual review recommended']
      }
    }
  }

  private async detectIssues(input: TruthCheckInput, analysis: any): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = []
    const content = input.content.toLowerCase()

    // Pattern-based detection
    for (const [issueType, rule] of Object.entries(this.DETECTION_RULES)) {
      for (const pattern of rule.patterns) {
        const matches = content.match(pattern)
        if (matches) {
          for (const match of matches) {
            const issue: DetectedIssue = {
              id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              assessmentId: '', // Will be set later
              messageId: input.messageId,
              issueType: issueType as IssueType,
              severityLevel: rule.severity,
              title: `${issueType.replace(/_/g, ' ')} Detected`,
              description: rule.description,
              explanation: `Pattern detected: "${match}" - ${rule.description}`,
              confidence: 0.8,
              textLocation: match,
              detectedAt: new Date(),
              isResolved: false
            }
            issues.push(issue)
          }
        }
      }
    }

    // Analysis-based detection
    if (analysis.concerns && analysis.concerns.length > 0) {
      for (const concern of analysis.concerns) {
        const issue: DetectedIssue = {
          id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          assessmentId: '', // Will be set later
          messageId: input.messageId,
          issueType: this.categorizeIssue(concern),
          severityLevel: this.assessSeverity(concern, analysis),
          title: 'Analysis-Based Concern',
          description: concern,
          explanation: `AI analysis identified: ${concern}`,
          confidence: analysis.confidenceLevel || 0.7,
          detectedAt: new Date(),
          isResolved: false
        }
        issues.push(issue)
      }
    }

    return issues
  }

  private categorizeIssue(concern: string): IssueType {
    const concernLower = concern.toLowerCase()
    
    if (concernLower.includes('fact') || concernLower.includes('incorrect')) {
      return 'FACTUAL_INACCURACY'
    } else if (concernLower.includes('logic') || concernLower.includes('contradict')) {
      return 'LOGICAL_INCONSISTENCY'
    } else if (concernLower.includes('hallucin') || concernLower.includes('fabricat')) {
      return 'HALLUCINATION'
    } else if (concernLower.includes('mislead') || concernLower.includes('decepti')) {
      return 'DECEPTION'
    } else if (concernLower.includes('unsupported') || concernLower.includes('claim')) {
      return 'UNSUPPORTED_CLAIM'
    } else {
      return 'LOGICAL_INCONSISTENCY'
    }
  }

  private assessSeverity(concern: string, analysis: any): SeverityLevel {
    const concernLower = concern.toLowerCase()
    const overallScore = analysis.overallScore || 0.5
    
    if (overallScore < 0.3 || concernLower.includes('critical') || concernLower.includes('false')) {
      return 'CRITICAL'
    } else if (overallScore < 0.5 || concernLower.includes('significant') || concernLower.includes('major')) {
      return 'HIGH'
    } else if (overallScore < 0.7 || concernLower.includes('concern') || concernLower.includes('issue')) {
      return 'MEDIUM'
    } else {
      return 'LOW'
    }
  }

  private async generateAlerts(input: TruthCheckInput, analysis: any, issues: DetectedIssue[]): Promise<TruthAlert[]> {
    const alerts: TruthAlert[] = []
    
    // Check thresholds and generate alerts
    for (const [alertType, threshold] of Object.entries(this.THRESHOLDS)) {
      const shouldAlert = this.shouldTriggerAlert(alertType as AlertType, threshold, analysis, issues)
      
      if (shouldAlert) {
        const alert: TruthAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          assessmentId: '', // Will be set later
          messageId: input.messageId,
          conversationId: input.conversationId,
          alertType: alertType as AlertType,
          severityLevel: this.getAlertSeverity(alertType as AlertType, analysis),
          title: this.getAlertTitle(alertType as AlertType),
          message: this.getAlertMessage(alertType as AlertType, analysis, issues),
          triggerThreshold: threshold,
          actualValue: this.getActualValue(alertType as AlertType, analysis),
          isActionRequired: this.isActionRequired(alertType as AlertType),
          triggeredAt: new Date(),
          isAcknowledged: false,
          isDismissed: false
        }
        alerts.push(alert)
      }
    }

    return alerts
  }

  private shouldTriggerAlert(alertType: AlertType, threshold: number, analysis: any, issues: DetectedIssue[]): boolean {
    switch (alertType) {
      case 'ACCURACY_WARNING':
        return analysis.accuracyScore < threshold
      case 'RELIABILITY_ALERT':
        return analysis.reliabilityScore < threshold
      case 'DECEPTION_DETECTED':
        return analysis.overallScore < threshold || issues.some(i => i.issueType === 'DECEPTION')
      case 'HALLUCINATION_ALERT':
        return analysis.overallScore < threshold || issues.some(i => i.issueType === 'HALLUCINATION')
      case 'CONSISTENCY_VIOLATION':
        return analysis.consistencyScore < threshold
      case 'FACTUAL_ERROR':
        return analysis.accuracyScore < threshold || issues.some(i => i.issueType === 'FACTUAL_INACCURACY')
      case 'LOGICAL_FALLACY':
        return analysis.consistencyScore < threshold || issues.some(i => i.issueType === 'LOGICAL_INCONSISTENCY')
      case 'CREDIBILITY_CONCERN':
        return analysis.reliabilityScore < threshold
      case 'VERIFICATION_NEEDED':
        return analysis.confidenceLevel < threshold
      case 'CRITICAL_ISSUE':
        return analysis.overallScore < threshold || issues.some(i => i.severityLevel === 'CRITICAL')
      default:
        return false
    }
  }

  private getAlertSeverity(alertType: AlertType, analysis: any): SeverityLevel {
    const overallScore = analysis.overallScore || 0.5
    
    if (overallScore < 0.3) return 'CRITICAL'
    if (overallScore < 0.5) return 'HIGH'
    if (overallScore < 0.7) return 'MEDIUM'
    return 'LOW'
  }

  private getAlertTitle(alertType: AlertType): string {
    const titles = {
      ACCURACY_WARNING: 'Accuracy Warning',
      RELIABILITY_ALERT: 'Reliability Alert',
      DECEPTION_DETECTED: 'Deception Detected',
      HALLUCINATION_ALERT: 'Hallucination Alert',
      CONSISTENCY_VIOLATION: 'Consistency Violation',
      FACTUAL_ERROR: 'Factual Error',
      LOGICAL_FALLACY: 'Logical Fallacy',
      CREDIBILITY_CONCERN: 'Credibility Concern',
      VERIFICATION_NEEDED: 'Verification Needed',
      CRITICAL_ISSUE: 'Critical Issue'
    }
    return titles[alertType] || 'Truth Alert'
  }

  private getAlertMessage(alertType: AlertType, analysis: any, issues: DetectedIssue[]): string {
    const score = analysis.overallScore || 0.5
    const issueCount = issues.length
    
    const messages = {
      ACCURACY_WARNING: `Accuracy concerns detected (Score: ${(score * 100).toFixed(1)}%). ${issueCount} issues identified.`,
      RELIABILITY_ALERT: `Reliability concerns detected (Score: ${(score * 100).toFixed(1)}%). Manual review recommended.`,
      DECEPTION_DETECTED: `Potential deception indicators found. ${issueCount} issues require attention.`,
      HALLUCINATION_ALERT: `Possible hallucination or fabrication detected. Verification required.`,
      CONSISTENCY_VIOLATION: `Consistency issues identified. Content may contain contradictions.`,
      FACTUAL_ERROR: `Factual accuracy concerns detected. Fact-checking recommended.`,
      LOGICAL_FALLACY: `Logical consistency issues found. Reasoning may be flawed.`,
      CREDIBILITY_CONCERN: `Credibility concerns raised. Additional verification needed.`,
      VERIFICATION_NEEDED: `Low confidence in assessment. Manual verification recommended.`,
      CRITICAL_ISSUE: `Critical truth reliability issues detected. Immediate attention required.`
    }
    
    return messages[alertType] || `Truth reliability concern detected (Score: ${(score * 100).toFixed(1)}%)`
  }

  private getActualValue(alertType: AlertType, analysis: any): number {
    switch (alertType) {
      case 'ACCURACY_WARNING':
      case 'FACTUAL_ERROR':
        return analysis.accuracyScore || 0.5
      case 'RELIABILITY_ALERT':
      case 'CREDIBILITY_CONCERN':
        return analysis.reliabilityScore || 0.5
      case 'CONSISTENCY_VIOLATION':
      case 'LOGICAL_FALLACY':
        return analysis.consistencyScore || 0.5
      case 'VERIFICATION_NEEDED':
        return analysis.confidenceLevel || 0.5
      default:
        return analysis.overallScore || 0.5
    }
  }

  private isActionRequired(alertType: AlertType): boolean {
    const actionRequiredTypes = [
      'DECEPTION_DETECTED',
      'HALLUCINATION_ALERT',
      'CRITICAL_ISSUE',
      'FACTUAL_ERROR'
    ]
    return actionRequiredTypes.includes(alertType)
  }

  private async createAssessment(input: TruthCheckInput, analysis: any, startTime: number): Promise<TruthAssessment> {
    const processingTime = Date.now() - startTime
    
    const assessment: TruthAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messageId: input.messageId,
      conversationId: input.conversationId,
      assessmentType: input.assessmentType || 'COMPREHENSIVE',
      overallScore: analysis.overallScore || 0.5,
      reliabilityScore: analysis.reliabilityScore || 0.5,
      accuracyScore: analysis.accuracyScore || 0.5,
      consistencyScore: analysis.consistencyScore || 0.5,
      analysisContent: analysis.analysisContent || 'Analysis completed',
      confidenceLevel: analysis.confidenceLevel || 0.7,
      methodology: analysis.methodology || 'Comprehensive AI-based truth assessment',
      processingTime,
      checkedAt: new Date(),
      checkedBy: 'truth-checker-v1.0'
    }

    return assessment
  }
}

export const truthCheckerService = new TruthCheckerService()
