-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('AI', 'HUMAN', 'SYSTEM', 'MODERATOR', 'TRUTH_CHECKER');

-- CreateEnum
CREATE TYPE "AnalyzerStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PersonaType" AS ENUM ('CREATIVE', 'NOVELTY', 'EDGE_CASE', 'RECURSIVE_LOGIC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApplicationMode" AS ENUM ('REGULAR', 'STOIC');

-- CreateEnum
CREATE TYPE "TruthAssessmentType" AS ENUM ('COMPREHENSIVE', 'FACTUAL_ONLY', 'LOGICAL_ONLY', 'CONSISTENCY_ONLY', 'DECEPTION_ONLY', 'QUICK_SCAN');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('FACTUAL_INACCURACY', 'LOGICAL_INCONSISTENCY', 'HALLUCINATION', 'DECEPTION', 'UNSUPPORTED_CLAIM', 'FABRICATED_DATA', 'CIRCULAR_REASONING', 'MISLEADING_STATEMENT', 'EVASIVE_RESPONSE', 'INCONSISTENT_NARRATIVE', 'MANIPULATIVE_LANGUAGE', 'SPECULATION_AS_FACT', 'OUTDATED_INFORMATION', 'MISREPRESENTATION', 'OVERGENERALIZATION');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('ACCURACY_WARNING', 'RELIABILITY_ALERT', 'DECEPTION_DETECTED', 'HALLUCINATION_ALERT', 'CONSISTENCY_VIOLATION', 'FACTUAL_ERROR', 'LOGICAL_FALLACY', 'CREDIBILITY_CONCERN', 'VERIFICATION_NEEDED', 'CRITICAL_ISSUE');

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "baseModel" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capabilities" TEXT NOT NULL,
    "contextWindow" INTEGER NOT NULL DEFAULT 8192,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "systemInstructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "isGitHubRepo" BOOLEAN NOT NULL DEFAULT false,
    "repoUrl" TEXT,
    "repoName" TEXT,
    "repoOwner" TEXT,
    "repoBranch" TEXT DEFAULT 'main',
    "repoLanguage" TEXT,
    "repoStars" INTEGER,
    "repoStructure" JSONB,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "modelAId" TEXT NOT NULL,
    "modelBId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sessionGoal" TEXT,
    "lastSpeakerId" TEXT,
    "moderatorContext" JSONB,
    "truthCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "truthCheckConfig" JSONB,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "modelId" TEXT,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chainOfThought" JSONB,
    "thoughtSteps" TEXT,
    "reasoningMeta" JSONB,
    "moderatorAction" TEXT,
    "nextSpeaker" TEXT,
    "promptForNext" TEXT,
    "truthCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
    "truthCheckStatus" TEXT DEFAULT 'PENDING',

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_documents" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logic_analyzer_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seedIdea" TEXT NOT NULL,
    "status" "AnalyzerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logic_analyzer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_assignments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "personaName" TEXT NOT NULL,
    "personaType" "PersonaType" NOT NULL,
    "personaData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logic_analyzer_results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "loopNumber" INTEGER NOT NULL,
    "response" TEXT NOT NULL,
    "chainOfThought" JSONB,
    "score" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logic_analyzer_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_sessions" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicationMode" "ApplicationMode" NOT NULL DEFAULT 'REGULAR',

    CONSTRAINT "ip_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_conversations" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "customName" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "savedBy" TEXT,
    "lastModified" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archived_conversations" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "archiveReason" TEXT,
    "archiveMetadata" JSONB,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT,

    CONSTRAINT "archived_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "originalConversationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "keyInsights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sessionGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "sourceMetadata" JSONB,
    "documentType" TEXT NOT NULL DEFAULT 'CONVERSATION_SUMMARY',

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truth_assessments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "assessmentType" "TruthAssessmentType" NOT NULL DEFAULT 'COMPREHENSIVE',
    "overallScore" DOUBLE PRECISION NOT NULL,
    "reliabilityScore" DOUBLE PRECISION NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "consistencyScore" DOUBLE PRECISION NOT NULL,
    "analysisContent" TEXT NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "methodology" TEXT NOT NULL,
    "processingTime" INTEGER,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedBy" TEXT,

    CONSTRAINT "truth_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detected_issues" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "severityLevel" "SeverityLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "suggestedAction" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "textLocation" TEXT,
    "contextBefore" TEXT,
    "contextAfter" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "detected_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truth_alerts" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "severityLevel" "SeverityLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "triggerThreshold" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "isActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" TIMESTAMP(3),
    "dismissedBy" TEXT,

    CONSTRAINT "truth_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truth_checker_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "baseModel" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "systemPrompt" TEXT NOT NULL,
    "detectionRules" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "assessmentCount" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION,
    "lastUsed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "truth_checker_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_documents_conversationId_documentId_key" ON "conversation_documents"("conversationId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "persona_assignments_sessionId_personaName_key" ON "persona_assignments"("sessionId", "personaName");

-- CreateIndex
CREATE UNIQUE INDEX "ip_sessions_ipAddress_key" ON "ip_sessions"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ip_sessions_sessionToken_key" ON "ip_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "saved_conversations_conversationId_key" ON "saved_conversations"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "archived_conversations_conversationId_key" ON "archived_conversations"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "truth_assessments_messageId_key" ON "truth_assessments"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "truth_checker_models_name_key" ON "truth_checker_models"("name");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_modelAId_fkey" FOREIGN KEY ("modelAId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_modelBId_fkey" FOREIGN KEY ("modelBId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_documents" ADD CONSTRAINT "conversation_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_assignments" ADD CONSTRAINT "persona_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "logic_analyzer_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_assignments" ADD CONSTRAINT "persona_assignments_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_analyzer_results" ADD CONSTRAINT "logic_analyzer_results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "logic_analyzer_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logic_analyzer_results" ADD CONSTRAINT "logic_analyzer_results_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "persona_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_conversations" ADD CONSTRAINT "saved_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archived_conversations" ADD CONSTRAINT "archived_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_originalConversationId_fkey" FOREIGN KEY ("originalConversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth_assessments" ADD CONSTRAINT "truth_assessments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth_assessments" ADD CONSTRAINT "truth_assessments_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detected_issues" ADD CONSTRAINT "detected_issues_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "truth_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detected_issues" ADD CONSTRAINT "detected_issues_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth_alerts" ADD CONSTRAINT "truth_alerts_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "truth_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth_alerts" ADD CONSTRAINT "truth_alerts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truth_alerts" ADD CONSTRAINT "truth_alerts_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
