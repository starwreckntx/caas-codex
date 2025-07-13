// Database types
export interface Model {
  id: string
  name: string
  persona: string
  baseModel: string
  provider: string
  description: string
  capabilities: string
  contextWindow: number
  category: string
  isActive: boolean
  systemInstructions: string
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  uploadDate: Date
  content: string | null
  // GitHub Repository fields
  isGitHubRepo: boolean
  repoUrl: string | null
  repoName: string | null
  repoOwner: string | null
  repoBranch: string | null
  repoLanguage: string | null
  repoStars: number | null
  repoStructure: any | null
  // Google Drive fields
  isGoogleDrive: boolean
  driveFileId: string | null
  driveFileName: string | null
  driveMimeType: string | null
  driveParentId: string | null
  driveWebViewLink: string | null
  driveDownloadLink: string | null
  driveOwnerEmail: string | null
  driveCreatedTime: Date | null
  driveModifiedTime: Date | null
  driveFileSize: bigint | null
}

export interface Conversation {
  id: string
  title: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  modelAId: string
  modelBId: string
  createdAt: Date
  updatedAt: Date
  // Moderator system fields
  moderatorEnabled: boolean
  sessionGoal?: string | null
  lastSpeakerId?: string | null
  moderatorContext?: any
  // Truth checking system fields
  truthCheckEnabled?: boolean
  truthCheckConfig?: any
  modelA?: Model
  modelB?: Model
  messages?: Message[]
  documents?: ConversationDocument[]
  // Truth assessment relationships
  truthAssessments?: TruthAssessment[]
  truthAlerts?: TruthAlert[]
}

export interface Message {
  id: string
  conversationId: string
  modelId: string | null
  content: string
  messageType: 'AI' | 'HUMAN' | 'SYSTEM' | 'MODERATOR' | 'TRUTH_CHECKER'
  isApproved: boolean
  createdAt: Date
  // Chain of Thought fields
  chainOfThought?: any
  thoughtSteps?: string | null
  reasoningMeta?: any
  // Moderator-specific fields
  moderatorAction?: string | null
  nextSpeaker?: string | null
  promptForNext?: string | null
  // Truth checking fields
  truthCheckEnabled?: boolean
  truthCheckStatus?: string | null
  model?: Model | null
  // Truth assessment relationships
  truthAssessment?: TruthAssessment
  detectedIssues?: DetectedIssue[]
  truthAlerts?: TruthAlert[]
}

export interface Session {
  id: string
  conversationId: string
  startTime: Date
  endTime: Date | null
  isActive: boolean
}

export interface ConversationDocument {
  id: string
  conversationId: string
  documentId: string
  addedAt: Date
  document?: Document
}

// Logic Analyzer types
export interface LogicAnalyzerSession {
  id: string
  title: string
  seedIdea: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  createdAt: Date
  updatedAt: Date
  assignments?: PersonaAssignment[]
  results?: LogicAnalyzerResult[]
}

export interface PersonaAssignment {
  id: string
  sessionId: string
  modelId: string
  personaName: string
  personaType: 'CREATIVE' | 'NOVELTY' | 'EDGE_CASE' | 'RECURSIVE_LOGIC' | 'CUSTOM'
  personaData?: any
  isActive: boolean
  createdAt: Date
  session?: LogicAnalyzerSession
  model?: Model
  results?: LogicAnalyzerResult[]
}

export interface LogicAnalyzerResult {
  id: string
  sessionId: string
  assignmentId: string
  loopNumber: number
  response: string
  chainOfThought?: any
  score?: number
  metadata?: any
  createdAt: Date
  session?: LogicAnalyzerSession
  assignment?: PersonaAssignment
}

// UI types
export interface ConversationWithDetails extends Conversation {
  modelA: Model
  modelB: Model
  messages: Message[]
  savedConversation?: SavedConversation | null
  archivedConversation?: ArchivedConversation | null
  knowledgeDocuments?: KnowledgeDocument[]
  roundTableConversation?: RoundTableConversation | null
  conversationTexts?: ConversationText[]
  conversationWisdom?: ConversationWisdom[]
  conversationExports?: ConversationExport[]
  _count?: {
    messages: number
  }
}

export type ConversationStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type MessageType = 'AI' | 'HUMAN' | 'SYSTEM' | 'MODERATOR' | 'TRUTH_CHECKER'
export type AnalyzerStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type PersonaType = 'CREATIVE' | 'NOVELTY' | 'EDGE_CASE' | 'RECURSIVE_LOGIC' | 'CUSTOM'

// Truth Assessment Types
export type TruthAssessmentType = 'COMPREHENSIVE' | 'FACTUAL_ONLY' | 'LOGICAL_ONLY' | 'CONSISTENCY_ONLY' | 'DECEPTION_ONLY' | 'QUICK_SCAN'
export type IssueType = 'FACTUAL_INACCURACY' | 'LOGICAL_INCONSISTENCY' | 'HALLUCINATION' | 'DECEPTION' | 'UNSUPPORTED_CLAIM' | 'FABRICATED_DATA' | 'CIRCULAR_REASONING' | 'MISLEADING_STATEMENT' | 'EVASIVE_RESPONSE' | 'INCONSISTENT_NARRATIVE' | 'MANIPULATIVE_LANGUAGE' | 'SPECULATION_AS_FACT' | 'OUTDATED_INFORMATION' | 'MISREPRESENTATION' | 'OVERGENERALIZATION'
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertType = 'ACCURACY_WARNING' | 'RELIABILITY_ALERT' | 'DECEPTION_DETECTED' | 'HALLUCINATION_ALERT' | 'CONSISTENCY_VIOLATION' | 'FACTUAL_ERROR' | 'LOGICAL_FALLACY' | 'CREDIBILITY_CONCERN' | 'VERIFICATION_NEEDED' | 'CRITICAL_ISSUE'

export interface TruthAssessment {
  id: string
  messageId: string
  conversationId: string
  assessmentType: TruthAssessmentType
  overallScore: number
  reliabilityScore: number
  accuracyScore: number
  consistencyScore: number
  analysisContent: string
  confidenceLevel: number
  methodology: string
  processingTime?: number
  checkedAt: Date
  checkedBy?: string
  detectedIssues?: DetectedIssue[]
  truthAlerts?: TruthAlert[]
}

export interface DetectedIssue {
  id: string
  assessmentId: string
  messageId: string
  issueType: IssueType
  severityLevel: SeverityLevel
  title: string
  description: string
  explanation: string
  suggestedAction?: string
  confidence: number
  textLocation?: string
  contextBefore?: string
  contextAfter?: string
  detectedAt: Date
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
}

export interface TruthAlert {
  id: string
  assessmentId: string
  messageId: string
  conversationId: string
  alertType: AlertType
  severityLevel: SeverityLevel
  title: string
  message: string
  triggerThreshold: number
  actualValue: number
  isActionRequired: boolean
  actionTaken?: string
  triggeredAt: Date
  isAcknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
  isDismissed: boolean
  dismissedAt?: Date
  dismissedBy?: string
}

export interface TruthCheckerModel {
  id: string
  name: string
  version: string
  baseModel: string
  provider: string
  specialization: string[]
  systemPrompt: string
  detectionRules: any
  thresholds: any
  assessmentCount: number
  averageAccuracy?: number
  lastUsed?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Moderator-specific types
export type ModeratorAction = 'DEVILS_ADVOCATE' | 'SUMMARIZATION' | 'FLOW_CONTROL' | 'SIMPLE_ACKNOWLEDGEMENT'
export type NextSpeaker = 'modelA' | 'modelB' | 'human'

export interface ModeratorInput {
  sessionGoal: string
  conversationHistory: Message[]
  lastSpeakerId: string | null
  lastMessageText: string
  conversationContext?: any
}

export interface ModeratorOutput {
  moderatorStatement: string
  nextSpeaker: NextSpeaker
  promptForNextSpeaker: string
  action: ModeratorAction
  chainOfThought?: any
}

// Form types
export interface CreateModelForm {
  name: string
  persona: string
  baseModel: string
  provider: string
  description: string
  capabilities: string
  contextWindow: number
  category: string
  isActive: boolean
  systemInstructions: string
}

export interface CreateConversationForm {
  title: string
  modelAId: string
  modelBId: string
  documentIds?: string[]
  moderatorEnabled?: boolean
  sessionGoal?: string
}

export interface CreateLogicAnalyzerSessionForm {
  title: string
  seedIdea: string
}

export interface CreatePersonaAssignmentForm {
  sessionId: string
  modelId: string
  personaName: string
  personaType: PersonaType
  personaData?: any
}

export interface GitHubRepoImportForm {
  repoUrl: string
  branch?: string
}

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  modifiedTime: string
  webViewLink: string
  iconLink?: string
  parents?: string[]
  ownerEmail?: string
  shared?: boolean
}

export interface GoogleDriveImportForm {
  selectedFiles: GoogleDriveFile[]
}

// Security and Session Management Types
export interface IpSession {
  id: string
  ipAddress: string
  isAuthenticated: boolean
  lastActivity: Date
  sessionToken?: string | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
  applicationMode: ApplicationMode
}

export type ApplicationMode = 'REGULAR' | 'STOIC'

// Enhanced Conversation Management Types
export interface SavedConversation {
  id: string
  conversationId: string
  customName?: string | null
  description?: string | null
  tags: string[]
  metadata?: any
  savedAt: Date
  savedBy?: string | null
  lastModified: Date
  conversation?: Conversation
}

export interface ArchivedConversation {
  id: string
  conversationId: string
  archiveReason?: string | null
  archiveMetadata?: any
  archivedAt: Date
  archivedBy?: string | null
  conversation?: Conversation
}

// Knowledge Transfer Types
export interface KnowledgeDocument {
  id: string
  originalConversationId: string
  title: string
  content: string
  summary?: string | null
  keyInsights: string[]
  tags: string[]
  participants: string[]
  sessionGoal?: string | null
  createdAt: Date
  updatedAt: Date
  createdBy?: string | null
  sourceMetadata?: any
  documentType: string
  conversation?: Conversation
}

// Enhanced Conversation with new relationships

// Form types for new features
export interface SaveConversationForm {
  conversationId: string
  customName?: string
  description?: string
  tags?: string[]
  metadata?: any
}

export interface ArchiveConversationForm {
  conversationId: string
  archiveReason?: string
  archiveMetadata?: any
}

export interface CreateKnowledgeDocumentForm {
  originalConversationId: string
  title: string
  content: string
  summary?: string
  keyInsights?: string[]
  tags?: string[]
  documentType?: string
}

// Session and security types
export interface AuthSession {
  isAuthenticated: boolean
  ipAddress: string
  sessionToken?: string
  expiresAt?: Date
  applicationMode?: ApplicationMode
}

export interface LoginForm {
  passphrase: string
}

// Enhanced Stoic Corner Types

export interface StoicText {
  id: string
  title: string
  author: string
  work: string
  category: string
  content: string
  excerpt?: string | null
  bookNumber?: number | null
  sectionNumber?: number | null
  originalLanguage: string
  translation?: string | null
  historicalContext?: string | null
  keyThemes: string[]
  difficulty: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  conversationTexts?: ConversationText[]
  wisdomReferences?: StoicWisdom[]
}

export interface StoicWisdom {
  id: string
  title: string
  content: string
  author: string
  category: string
  type: WisdomType
  difficulty: number
  timeToComplete?: number | null
  keyThemes: string[]
  tags: string[]
  dailyReflection: boolean
  practicalExercise: boolean
  isActive: boolean
  sourceTextId?: string | null
  createdAt: Date
  updatedAt: Date
  sourceText?: StoicText | null
  conversationWisdom?: ConversationWisdom[]
}

export interface RoundTableConversation {
  id: string
  conversationId: string
  maxParticipants: number
  currentSpeaker?: string | null
  speakingOrder: any // Json type for participant order
  moderationStyle: string
  roundNumber: number
  topicFocus?: string | null
  userParticipation: boolean
  userRole: UserRole
  createdAt: Date
  updatedAt: Date
  conversation?: Conversation
  participants?: RoundTableParticipant[]
}

export interface RoundTableParticipant {
  id: string
  roundTableId: string
  modelId?: string | null
  participantType: ParticipantType
  speakingOrder: number
  isActive: boolean
  lastSpoke?: Date | null
  messageCount: number
  joinedAt: Date
  roundTable?: RoundTableConversation
  model?: Model | null
}

export interface ConversationText {
  id: string
  conversationId: string
  textId: string
  addedAt: Date
  addedBy?: string | null
  relevanceNote?: string | null
  conversation?: Conversation
  text?: StoicText
}

export interface ConversationWisdom {
  id: string
  conversationId: string
  wisdomId: string
  addedAt: Date
  addedBy?: string | null
  contextNote?: string | null
  conversation?: Conversation
  wisdom?: StoicWisdom
}

export interface ConversationExport {
  id: string
  conversationId: string
  exportFormat: ExportFormat
  fileName: string
  filePath?: string | null
  metadata?: any
  exportedAt: Date
  exportedBy?: string | null
  downloadCount: number
  isPublic: boolean
  conversation?: Conversation
}

// Enhanced Stoic Corner Enums and Types

export type WisdomType = 'QUOTE' | 'EXERCISE' | 'MEDITATION' | 'REFLECTION' | 'PRINCIPLE' | 'PRACTICE'
export type UserRole = 'OBSERVER' | 'PARTICIPANT' | 'MODERATOR' | 'FACILITATOR'
export type ParticipantType = 'AI_STOIC' | 'HUMAN_USER' | 'SYSTEM_MODERATOR'
export type ExportFormat = 'PDF' | 'MARKDOWN' | 'TXT' | 'HTML' | 'JSON'

// Enhanced Conversation with Stoic features
export interface ConversationWithStoicDetails extends ConversationWithDetails {
  roundTableConversation?: RoundTableConversation | null
  conversationTexts?: ConversationText[]
  conversationWisdom?: ConversationWisdom[]
  conversationExports?: ConversationExport[]
}

// Form types for Stoic Corner features

export interface CreateStoicTextForm {
  title: string
  author: string
  work: string
  category: string
  content: string
  excerpt?: string
  bookNumber?: number
  sectionNumber?: number
  originalLanguage?: string
  translation?: string
  historicalContext?: string
  keyThemes?: string[]
  difficulty?: number
}

export interface CreateStoicWisdomForm {
  title: string
  content: string
  author: string
  category: string
  type: WisdomType
  difficulty?: number
  timeToComplete?: number
  keyThemes?: string[]
  tags?: string[]
  dailyReflection?: boolean
  practicalExercise?: boolean
  sourceTextId?: string
}

export interface CreateRoundTableForm {
  title: string
  participantIds: string[]
  maxParticipants?: number
  moderationStyle?: string
  topicFocus?: string
  userParticipation?: boolean
  userRole?: UserRole
}

export interface RoundTableConversationForm extends CreateConversationForm {
  roundTable: CreateRoundTableForm
}

export interface ExportConversationForm {
  conversationId: string
  exportFormat: ExportFormat
  includeMetadata?: boolean
  includeTexts?: boolean
  includeWisdom?: boolean
  customFileName?: string
}

export interface AddTextToConversationForm {
  conversationId: string
  textId: string
  relevanceNote?: string
}

export interface AddWisdomToConversationForm {
  conversationId: string
  wisdomId: string
  contextNote?: string
}

// User interaction types for Stoic Corner

export interface UserMessage {
  content: string
  messageType: 'HUMAN'
  conversationId: string
}

export interface StoicConversationSettings {
  allowUserParticipation: boolean
  userRole: UserRole
  moderationStyle: string
  truthCheckEnabled: boolean
  exportEnabled: boolean
}

// Search and filter types for Texts and Wisdom

export interface StoicTextFilters {
  author?: string
  work?: string
  category?: string
  difficulty?: number
  keyThemes?: string[]
  searchTerm?: string
}

export interface StoicWisdomFilters {
  author?: string
  type?: WisdomType
  category?: string
  difficulty?: number
  tags?: string[]
  dailyReflection?: boolean
  practicalExercise?: boolean
  searchTerm?: string
}

export interface TextSearchResult {
  text: StoicText
  relevanceScore: number
  matchedTerms: string[]
}

export interface WisdomSearchResult {
  wisdom: StoicWisdom
  relevanceScore: number
  matchedTerms: string[]
}