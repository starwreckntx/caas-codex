
import { ModeratorInput, ModeratorOutput, ModeratorAction, NextSpeaker, Message } from './types'

export class MindDojoModerator {
  private static readonly MODERATOR_PERSONA = `
You are the Mind Dojo Moderator, a sophisticated AI facilitator designed to enhance structured conversations between two AI participants (Speaker A and Speaker B). Your role is to:

1. Remain impartial and objective, focusing on process and goals rather than content opinions
2. Manage turn-taking and maintain productive conversation flow
3. Ensure discussions stay aligned with the session goal
4. Provide strategic interventions when needed
5. Maintain a neutral, professional tone throughout

Your responses should be concise, actionable, and focused on facilitating better dialogue between the participants.
`

  // Enhanced prompt banks for dynamic moderation
  private static readonly PROMPT_BANKS = {
    ETHICAL_IMPLICATIONS: [
      "What are the ethical implications of this approach?",
      "How might this impact different stakeholders?",
      "What moral considerations should we examine here?",
      "Are there any ethical blind spots we're missing?",
      "What would be the right thing to do in this situation?"
    ],
    ANALOGY_REQUESTS: [
      "Can you explain this concept using a simple analogy?",
      "What real-world parallel can help us understand this better?",
      "How would you describe this to someone from a different field?",
      "What metaphor captures the essence of this idea?",
      "Can you paint a picture that illustrates this concept?"
    ],
    COUNTER_ARGUMENTS: [
      "What's the strongest argument against this position?",
      "How would a skeptic respond to this reasoning?",
      "What evidence contradicts this viewpoint?",
      "Where are the weak points in this logic?",
      "What would someone with opposing views say?"
    ],
    RISK_ANALYSIS: [
      "What could go wrong with this approach?",
      "What are the potential unintended consequences?",
      "How might this fail in practice?",
      "What risks are we not considering?",
      "What's the downside scenario here?"
    ],
    CREATIVE_THINKING: [
      "What if we approached this from a completely different angle?",
      "How might someone from another discipline solve this?",
      "What unconventional solutions haven't we considered?",
      "What would happen if we reversed our assumptions?",
      "How can we think outside the box on this?"
    ],
    PERSPECTIVE_SHIFTS: [
      "How would this look from the opposite perspective?",
      "What would a future generation think of this approach?",
      "How might different cultures view this differently?",
      "What would someone with lived experience say?",
      "How does this change if we zoom out to the bigger picture?"
    ],
    DEEPER_EXPLORATION: [
      "What underlying assumptions are we making here?",
      "Can we dig deeper into the root cause?",
      "What are we not seeing beneath the surface?",
      "How does this connect to broader principles?",
      "What's the fundamental question we should be asking?"
    ],
    PRACTICAL_APPLICATION: [
      "How would this work in the real world?",
      "What would implementation actually look like?",
      "How do we bridge theory and practice here?",
      "What concrete steps would this require?",
      "How do we test this idea in practice?"
    ],
    SYNTHESIS_BUILDING: [
      "How do these different ideas connect?",
      "What patterns are emerging from our discussion?",
      "How can we build on what's been shared?",
      "What's the common thread here?",
      "How do these pieces fit together?"
    ]
  }

  // Memory system to track used prompts and avoid repetition
  private static conversationMemory: Map<string, {
    usedPrompts: Set<string>,
    topicThemes: string[],
    lastModeratorActions: ModeratorAction[],
    speakerEngagement: { modelA: number, modelB: number }
  }> = new Map()

  // Human intervention types
  public static readonly HUMAN_INTERVENTION_TYPES = {
    SUGGEST_DIRECTION: 'SUGGEST_DIRECTION',
    INJECT_CREATIVITY: 'INJECT_CREATIVITY', 
    CHALLENGE_THINKING: 'CHALLENGE_THINKING',
    NEW_PERSPECTIVE: 'NEW_PERSPECTIVE'
  }

  /**
   * Main processing method that analyzes conversation context and determines moderator action
   */
  public static async processConversation(input: ModeratorInput): Promise<ModeratorOutput> {
    try {
      const conversationId = input.conversationContext?.conversationId || 'default'
      
      // Initialize conversation memory if it doesn't exist
      if (!this.conversationMemory.has(conversationId)) {
        this.conversationMemory.set(conversationId, {
          usedPrompts: new Set(),
          topicThemes: [],
          lastModeratorActions: [],
          speakerEngagement: { modelA: 0, modelB: 0 }
        })
      }
      
      // Analyze conversation context with enhanced intelligence
      const analysis = this.analyzeConversationContext(input)
      
      // Determine appropriate moderator action with sophistication
      const action = this.determineModeratorActionAdvanced(analysis, input)
      
      // Generate dynamic moderator statement
      const moderatorStatement = this.generateDynamicModeratorStatement(action, analysis, input)
      
      // Determine next speaker with context awareness
      const nextSpeaker = this.determineNextSpeakerIntelligent(action, input, analysis)
      
      // Generate natural prompt for next speaker
      const promptForNextSpeaker = this.generateNaturalHandoff(action, nextSpeaker, input, analysis)
      
      // Update conversation memory
      this.updateConversationMemory(conversationId, action, moderatorStatement, input)
      
      // Generate enhanced chain of thought
      const chainOfThought = this.generateEnhancedChainOfThought(analysis, action, input)
      
      return {
        moderatorStatement,
        nextSpeaker,
        promptForNextSpeaker,
        action,
        chainOfThought
      }
    } catch (error) {
      console.error('Error in Mind Dojo Moderator processing:', error)
      
      // Enhanced fallback with natural language
      return {
        moderatorStatement: "I acknowledge the previous message. Let's continue building on this discussion.",
        nextSpeaker: input.lastSpeakerId === 'modelA' ? 'modelB' : 'modelA',
        promptForNextSpeaker: `Please respond to the previous message while keeping our session goal in mind: ${input.sessionGoal}`,
        action: 'SIMPLE_ACKNOWLEDGEMENT',
        chainOfThought: {
          error: true,
          message: 'Fallback to simple acknowledgement due to processing error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Analyzes conversation context to understand current state and needs
   */
  private static analyzeConversationContext(input: ModeratorInput) {
    const { conversationHistory, sessionGoal, lastSpeakerId, lastMessageText } = input
    
    // Count messages and analyze patterns
    const messageCount = conversationHistory.length
    const recentMessages = conversationHistory.slice(-5) // Last 5 messages
    
    // Analyze conversation patterns
    const speakerPattern = this.analyzeSpeakerPattern(conversationHistory)
    const topicDrift = this.analyzeTopicDrift(recentMessages, sessionGoal)
    const conversationDepth = this.analyzeConversationDepth(recentMessages)
    const stagnationRisk = this.analyzeStagnationRisk(recentMessages)
    
    return {
      messageCount,
      recentMessages,
      speakerPattern,
      topicDrift,
      conversationDepth,
      stagnationRisk,
      sessionGoal,
      lastSpeakerId,
      lastMessageText
    }
  }

  /**
   * Advanced moderator action determination with enhanced intelligence
   */
  private static determineModeratorActionAdvanced(analysis: any, input: ModeratorInput): ModeratorAction {
    const { messageCount, topicDrift, conversationDepth, stagnationRisk, speakerPattern } = analysis
    const conversationId = input.conversationContext?.conversationId || 'default'
    const memory = this.conversationMemory.get(conversationId)
    
    // Enhanced decision tree with memory awareness
    
    // 1. Prevent action repetition - if last two actions were the same, diversify
    if (memory && memory.lastModeratorActions.length >= 2) {
      const lastTwoActions = memory.lastModeratorActions.slice(-2)
      if (lastTwoActions[0] === lastTwoActions[1]) {
        // Force diversification - choose different action
        const excludedAction = lastTwoActions[0]
        return this.selectDiversifiedAction(analysis, excludedAction)
      }
    }
    
    // 2. High topic drift - need flow control
    if (topicDrift > 0.7) {
      return 'FLOW_CONTROL'
    }
    
    // 3. Critical stagnation - need devil's advocate
    if (stagnationRisk > 0.7) {
      return 'DEVILS_ADVOCATE'
    }
    
    // 4. Deep conversation needs synthesis
    if (messageCount % 8 === 0 || (messageCount > 10 && conversationDepth > 0.8)) {
      return 'SUMMARIZATION'
    }
    
    // 5. Unbalanced speaker pattern - flow control
    if (speakerPattern.imbalance > 0.6) {
      return 'FLOW_CONTROL'
    }
    
    // 6. Medium stagnation - mix of acknowledgment and challenge
    if (stagnationRisk > 0.4) {
      return messageCount % 2 === 0 ? 'DEVILS_ADVOCATE' : 'SIMPLE_ACKNOWLEDGEMENT'
    }
    
    // 7. Pattern-based decisions for variety
    if (messageCount % 5 === 0) {
      return 'SUMMARIZATION'
    }
    
    if (messageCount % 3 === 0) {
      return 'DEVILS_ADVOCATE'
    }
    
    // 8. Default to acknowledgment for steady progress
    return 'SIMPLE_ACKNOWLEDGEMENT'
  }
  
  /**
   * Selects a diversified action to avoid repetition
   */
  private static selectDiversifiedAction(analysis: any, excludedAction: ModeratorAction): ModeratorAction {
    const { stagnationRisk, topicDrift, conversationDepth } = analysis
    
    const availableActions = ['DEVILS_ADVOCATE', 'SUMMARIZATION', 'FLOW_CONTROL', 'SIMPLE_ACKNOWLEDGEMENT']
      .filter(action => action !== excludedAction) as ModeratorAction[]
    
    // Choose based on current needs
    if (stagnationRisk > 0.5 && excludedAction !== 'DEVILS_ADVOCATE') {
      return 'DEVILS_ADVOCATE'
    }
    
    if (topicDrift > 0.5 && excludedAction !== 'FLOW_CONTROL') {
      return 'FLOW_CONTROL'
    }
    
    if (conversationDepth > 0.7 && excludedAction !== 'SUMMARIZATION') {
      return 'SUMMARIZATION'
    }
    
    // Random selection from available actions
    return availableActions[Math.floor(Math.random() * availableActions.length)]
  }

  /**
   * Generates dynamic moderator statement using enhanced prompt banks
   */
  private static generateDynamicModeratorStatement(action: ModeratorAction, analysis: any, input: ModeratorInput): string {
    const conversationId = input.conversationContext?.conversationId || 'default'
    const memory = this.conversationMemory.get(conversationId)
    
    switch (action) {
      case 'DEVILS_ADVOCATE':
        return this.generateDynamicDevilsAdvocateStatement(analysis, input, memory)
      
      case 'SUMMARIZATION':
        return this.generateDynamicSummarizationStatement(analysis, input, memory)
      
      case 'FLOW_CONTROL':
        return this.generateDynamicFlowControlStatement(analysis, input, memory)
      
      case 'SIMPLE_ACKNOWLEDGEMENT':
        return this.generateDynamicAcknowledgement(analysis, input, memory)
      
      default:
        return "I acknowledge the previous message. Let's continue building on this discussion."
    }
  }

  /**
   * Intelligent next speaker determination with context awareness
   */
  private static determineNextSpeakerIntelligent(action: ModeratorAction, input: ModeratorInput, analysis: any): NextSpeaker {
    const { lastSpeakerId, conversationHistory } = input
    const { speakerPattern } = analysis
    
    // For flow control, balance speaker engagement
    if (action === 'FLOW_CONTROL') {
      if (speakerPattern.imbalance > 0.5) {
        // Switch to the less active speaker
        return speakerPattern.lessActiveId as NextSpeaker
      }
    }
    
    // For devil's advocate, engage the other speaker to respond to challenge
    if (action === 'DEVILS_ADVOCATE') {
      return lastSpeakerId === 'modelA' ? 'modelB' : 'modelA'
    }
    
    // For summarization, continue with current speaker for continuity
    if (action === 'SUMMARIZATION') {
      return lastSpeakerId === 'modelA' ? 'modelA' : 'modelB'
    }
    
    // Default alternating pattern for acknowledgement
    return lastSpeakerId === 'modelA' ? 'modelB' : 'modelA'
  }

  /**
   * Generates natural handoff with direct questions to next speaker
   */
  private static generateNaturalHandoff(action: ModeratorAction, nextSpeaker: NextSpeaker, input: ModeratorInput, analysis: any): string {
    const { sessionGoal, lastMessageText, conversationHistory } = input
    const { lastSpeakerId } = input
    
    // Get model names for natural references
    const modelAName = this.getModelName(conversationHistory, 'modelA')
    const modelBName = this.getModelName(conversationHistory, 'modelB')
    const nextSpeakerName = nextSpeaker === 'modelA' ? modelAName : modelBName
    const lastSpeakerName = lastSpeakerId === 'modelA' ? modelAName : modelBName
    
    // Generate natural transitions based on action
    switch (action) {
      case 'DEVILS_ADVOCATE':
        return this.generateNaturalDevilsAdvocateHandoff(nextSpeakerName, lastSpeakerName, sessionGoal, lastMessageText)
      
      case 'SUMMARIZATION':
        return this.generateNaturalSummarizationHandoff(nextSpeakerName, lastSpeakerName, sessionGoal, analysis)
      
      case 'FLOW_CONTROL':
        return this.generateNaturalFlowControlHandoff(nextSpeakerName, lastSpeakerName, sessionGoal, analysis)
      
      case 'SIMPLE_ACKNOWLEDGEMENT':
        return this.generateNaturalAcknowledgementHandoff(nextSpeakerName, lastSpeakerName, sessionGoal, lastMessageText)
      
      default:
        return `${nextSpeakerName}, please continue our discussion toward: ${sessionGoal}`
    }
  }

  /**
   * Generates dynamic devil's advocate statement using enhanced prompt banks
   */
  private static generateDynamicDevilsAdvocateStatement(analysis: any, input: ModeratorInput, memory: any): string {
    const conversationId = input.conversationContext?.conversationId || 'default'
    const { stagnationRisk, conversationDepth } = analysis
    
    // Choose prompt category based on conversation state
    let promptCategory = 'COUNTER_ARGUMENTS'
    
    if (stagnationRisk > 0.7) {
      promptCategory = 'CREATIVE_THINKING'
    } else if (conversationDepth > 0.6) {
      promptCategory = 'DEEPER_EXPLORATION'
    } else if (Math.random() > 0.5) {
      promptCategory = 'RISK_ANALYSIS'
    }
    
    // Get unused prompt from the selected category
    const availablePrompts = this.PROMPT_BANKS[promptCategory as keyof typeof this.PROMPT_BANKS]
    const unusedPrompts = availablePrompts.filter(prompt => !memory?.usedPrompts.has(prompt))
    
    if (unusedPrompts.length === 0) {
      // If all prompts have been used, reset and use any
      memory?.usedPrompts.clear()
      return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    }
    
    return unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)]
  }

  /**
   * Generates dynamic summarization statement using enhanced prompt banks
   */
  private static generateDynamicSummarizationStatement(analysis: any, input: ModeratorInput, memory: any): string {
    const { conversationDepth, messageCount } = analysis
    
    // Choose prompt category based on conversation state
    let promptCategory = 'SYNTHESIS_BUILDING'
    
    if (conversationDepth > 0.7) {
      promptCategory = 'DEEPER_EXPLORATION'
    } else if (messageCount > 15) {
      promptCategory = 'PRACTICAL_APPLICATION'
    }
    
    // Get unused prompt from the selected category
    const availablePrompts = this.PROMPT_BANKS[promptCategory as keyof typeof this.PROMPT_BANKS]
    const unusedPrompts = availablePrompts.filter(prompt => !memory?.usedPrompts.has(prompt))
    
    if (unusedPrompts.length === 0) {
      // If all prompts have been used, reset and use any
      memory?.usedPrompts.clear()
      return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    }
    
    return unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)]
  }

  /**
   * Generates dynamic flow control statement using enhanced prompt banks
   */
  private static generateDynamicFlowControlStatement(analysis: any, input: ModeratorInput, memory: any): string {
    const { sessionGoal, topicDrift, speakerPattern } = analysis
    
    if (topicDrift > 0.7) {
      return `I notice we may be drifting from our core focus. Let's refocus on our session goal: "${sessionGoal}"`
    }
    
    // Choose prompt category based on conversation state
    let promptCategory = 'PRACTICAL_APPLICATION'
    
    if (speakerPattern.imbalance > 0.6) {
      promptCategory = 'PERSPECTIVE_SHIFTS'
    } else if (topicDrift > 0.4) {
      promptCategory = 'DEEPER_EXPLORATION'
    }
    
    // Get unused prompt from the selected category
    const availablePrompts = this.PROMPT_BANKS[promptCategory as keyof typeof this.PROMPT_BANKS]
    const unusedPrompts = availablePrompts.filter(prompt => !memory?.usedPrompts.has(prompt))
    
    if (unusedPrompts.length === 0) {
      // If all prompts have been used, reset and use any
      memory?.usedPrompts.clear()
      return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    }
    
    return unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)]
  }

  /**
   * Generates dynamic acknowledgement statement using enhanced prompt banks
   */
  private static generateDynamicAcknowledgement(analysis: any, input: ModeratorInput, memory: any): string {
    const { conversationDepth, messageCount } = analysis
    
    // Choose prompt category based on conversation state
    let promptCategory = 'SYNTHESIS_BUILDING'
    
    if (conversationDepth < 0.3) {
      promptCategory = 'ANALOGY_REQUESTS'
    } else if (messageCount > 10) {
      promptCategory = 'PRACTICAL_APPLICATION'
    } else if (Math.random() > 0.6) {
      promptCategory = 'PERSPECTIVE_SHIFTS'
    }
    
    // Get unused prompt from the selected category
    const availablePrompts = this.PROMPT_BANKS[promptCategory as keyof typeof this.PROMPT_BANKS]
    const unusedPrompts = availablePrompts.filter(prompt => !memory?.usedPrompts.has(prompt))
    
    if (unusedPrompts.length === 0) {
      // If all prompts have been used, reset and use any
      memory?.usedPrompts.clear()
      return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    }
    
    return unusedPrompts[Math.floor(Math.random() * unusedPrompts.length)]
  }

  /**
   * Updates conversation memory with new information
   */
  private static updateConversationMemory(conversationId: string, action: ModeratorAction, statement: string, input: ModeratorInput): void {
    const memory = this.conversationMemory.get(conversationId)
    if (!memory) return
    
    // Add used prompt to memory
    memory.usedPrompts.add(statement)
    
    // Update moderator actions history
    memory.lastModeratorActions.push(action)
    if (memory.lastModeratorActions.length > 10) {
      memory.lastModeratorActions.shift() // Keep only last 10 actions
    }
    
    // Update speaker engagement tracking
    if (input.lastSpeakerId === 'modelA') {
      memory.speakerEngagement.modelA++
    } else if (input.lastSpeakerId === 'modelB') {
      memory.speakerEngagement.modelB++
    }
    
    // Extract and store topic themes (simple keyword extraction)
    const keywords = this.extractTopicKeywords(input.lastMessageText)
    memory.topicThemes = [...new Set([...memory.topicThemes, ...keywords])].slice(-20) // Keep last 20 themes
  }

  /**
   * Generates enhanced chain of thought for transparency
   */
  private static generateEnhancedChainOfThought(analysis: any, action: ModeratorAction, input: ModeratorInput) {
    const conversationId = input.conversationContext?.conversationId || 'default'
    const memory = this.conversationMemory.get(conversationId)
    
    return {
      timestamp: new Date().toISOString(),
      conversationId,
      analysis: {
        messageCount: analysis.messageCount,
        topicDrift: analysis.topicDrift,
        conversationDepth: analysis.conversationDepth,
        stagnationRisk: analysis.stagnationRisk,
        speakerImbalance: analysis.speakerPattern.imbalance
      },
      memoryState: {
        usedPromptsCount: memory?.usedPrompts.size || 0,
        recentActions: memory?.lastModeratorActions.slice(-3) || [],
        topicThemes: memory?.topicThemes.slice(-5) || [],
        speakerEngagement: memory?.speakerEngagement || { modelA: 0, modelB: 0 }
      },
      decisionFactors: {
        primaryTrigger: this.getActionTrigger(action),
        sessionGoal: input.sessionGoal,
        lastSpeaker: input.lastSpeakerId,
        diversificationApplied: this.wasActionDiversified(memory, action)
      },
      selectedAction: action,
      reasoning: this.getEnhancedActionReasoning(action, analysis, memory)
    }
  }

  /**
   * Extracts model name from conversation history
   */
  private static getModelName(conversationHistory: Message[], modelRole: 'modelA' | 'modelB'): string {
    // Try to find model name from conversation history
    const modelMessage = conversationHistory.find(msg => 
      msg.modelId && msg.model?.name
    )
    
    if (modelMessage?.model?.name) {
      // Extract first word or abbreviation from model name
      const name = modelMessage.model.name.split(' ')[0]
      return name.length > 10 ? name.substring(0, 10) : name
    }
    
    // Fallback to role names
    return modelRole === 'modelA' ? 'Participant A' : 'Participant B'
  }

  /**
   * Generates natural devil's advocate handoff
   */
  private static generateNaturalDevilsAdvocateHandoff(nextSpeakerName: string, lastSpeakerName: string, sessionGoal: string, lastMessageText: string): string {
    const handoffs = [
      `${nextSpeakerName}, ${lastSpeakerName} made some interesting points. How would you challenge or build on that perspective?`,
      `${nextSpeakerName}, what's your take on ${lastSpeakerName}'s reasoning? Any concerns or alternative approaches?`,
      `${nextSpeakerName}, I'd like to hear your response to ${lastSpeakerName}'s position. What questions does it raise for you?`,
      `${nextSpeakerName}, ${lastSpeakerName} presented their view. What counterarguments or refinements would you add?`,
      `${nextSpeakerName}, considering what ${lastSpeakerName} shared, how might we strengthen or challenge this line of thinking?`
    ]
    
    return handoffs[Math.floor(Math.random() * handoffs.length)]
  }

  /**
   * Generates natural summarization handoff
   */
  private static generateNaturalSummarizationHandoff(nextSpeakerName: string, lastSpeakerName: string, sessionGoal: string, analysis: any): string {
    const handoffs = [
      `${nextSpeakerName}, building on what we've discussed, how do you see us progressing toward "${sessionGoal}"?`,
      `${nextSpeakerName}, given the themes emerging from our conversation, what's your next contribution to achieving "${sessionGoal}"?`,
      `${nextSpeakerName}, considering the key points raised, how would you advance our discussion toward "${sessionGoal}"?`,
      `${nextSpeakerName}, with these insights in mind, what direction should we explore next for "${sessionGoal}"?`,
      `${nextSpeakerName}, based on our discussion so far, what's your perspective on reaching "${sessionGoal}"?`
    ]
    
    return handoffs[Math.floor(Math.random() * handoffs.length)]
  }

  /**
   * Generates natural flow control handoff
   */
  private static generateNaturalFlowControlHandoff(nextSpeakerName: string, lastSpeakerName: string, sessionGoal: string, analysis: any): string {
    const handoffs = [
      `${nextSpeakerName}, let's refocus on "${sessionGoal}". What's your focused contribution to this objective?`,
      `${nextSpeakerName}, bringing us back to our core goal of "${sessionGoal}", what's your targeted input?`,
      `${nextSpeakerName}, to ensure we're aligned with "${sessionGoal}", what specific direction would you take?`,
      `${nextSpeakerName}, keeping "${sessionGoal}" as our north star, what's your strategic response?`,
      `${nextSpeakerName}, with our objective of "${sessionGoal}" in mind, how would you steer this forward?`
    ]
    
    return handoffs[Math.floor(Math.random() * handoffs.length)]
  }

  /**
   * Generates natural acknowledgement handoff
   */
  private static generateNaturalAcknowledgementHandoff(nextSpeakerName: string, lastSpeakerName: string, sessionGoal: string, lastMessageText: string): string {
    const handoffs = [
      `${nextSpeakerName}, that's a solid foundation from ${lastSpeakerName}. How would you build on it?`,
      `${nextSpeakerName}, ${lastSpeakerName} shared valuable insights. What's your perspective?`,
      `${nextSpeakerName}, following ${lastSpeakerName}'s contribution, where would you take this discussion?`,
      `${nextSpeakerName}, ${lastSpeakerName} set up an interesting thread. How do you see it developing?`,
      `${nextSpeakerName}, building on ${lastSpeakerName}'s thoughts, what would you add or explore next?`
    ]
    
    return handoffs[Math.floor(Math.random() * handoffs.length)]
  }

  /**
   * Extracts topic keywords from message text
   */
  private static extractTopicKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an'])
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5) // Take first 5 meaningful words
  }

  /**
   * Checks if action was diversified to avoid repetition
   */
  private static wasActionDiversified(memory: any, action: ModeratorAction): boolean {
    if (!memory || memory.lastModeratorActions.length < 2) return false
    
    const lastTwoActions = memory.lastModeratorActions.slice(-2)
    return lastTwoActions[0] === lastTwoActions[1] && lastTwoActions[1] !== action
  }

  /**
   * Gets enhanced reasoning for action selection
   */
  private static getEnhancedActionReasoning(action: ModeratorAction, analysis: any, memory: any): string {
    const baseReasoning = this.getActionReasoning(action, analysis)
    
    if (memory && memory.lastModeratorActions.length > 0) {
      const recentActions = memory.lastModeratorActions.slice(-3).join(' → ')
      return `${baseReasoning} Recent action pattern: ${recentActions}`
    }
    
    return baseReasoning
  }

  /**
   * Analyzes speaker participation patterns
   */
  private static analyzeSpeakerPattern(conversationHistory: Message[]) {
    const speakerCounts = { modelA: 0, modelB: 0, human: 0 }
    
    conversationHistory.forEach(msg => {
      if (msg.modelId) {
        // Determine if this is modelA or modelB based on context
        const speakerId = msg.modelId // This would need to be mapped to modelA/modelB
        speakerCounts[speakerId as keyof typeof speakerCounts]++
      }
    })
    
    const total = speakerCounts.modelA + speakerCounts.modelB
    const imbalance = total > 0 ? Math.abs(speakerCounts.modelA - speakerCounts.modelB) / total : 0
    const lessActiveId = speakerCounts.modelA < speakerCounts.modelB ? 'modelA' : 'modelB'
    
    return { speakerCounts, imbalance, lessActiveId }
  }

  /**
   * Analyzes topic drift from session goal
   */
  private static analyzeTopicDrift(recentMessages: Message[], sessionGoal: string): number {
    // Simple heuristic: if messages are getting longer or more complex, might indicate drift
    // In a real implementation, this would use semantic analysis
    if (recentMessages.length === 0) return 0
    
    const avgLength = recentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / recentMessages.length
    const lengthDrift = Math.min(avgLength / 1000, 1) // Normalize to 0-1
    
    return lengthDrift * 0.5 // Conservative estimate
  }

  /**
   * Analyzes conversation depth and complexity
   */
  private static analyzeConversationDepth(recentMessages: Message[]): number {
    if (recentMessages.length === 0) return 0
    
    // Simple heuristic based on message length and complexity indicators
    const avgLength = recentMessages.reduce((sum, msg) => sum + msg.content.length, 0) / recentMessages.length
    const complexityIndicators = recentMessages.reduce((sum, msg) => {
      const content = msg.content.toLowerCase()
      let score = 0
      
      // Look for complexity indicators
      if (content.includes('because') || content.includes('therefore')) score += 0.1
      if (content.includes('however') || content.includes('although')) score += 0.1
      if (content.includes('consider') || content.includes('analyze')) score += 0.1
      if (content.includes('framework') || content.includes('approach')) score += 0.1
      
      return sum + score
    }, 0)
    
    return Math.min((avgLength / 500) + (complexityIndicators / recentMessages.length), 1)
  }

  /**
   * Analyzes risk of conversation stagnation
   */
  private static analyzeStagnationRisk(recentMessages: Message[]): number {
    if (recentMessages.length < 3) return 0
    
    // Look for repetitive patterns or lack of progression
    const lastThreeMessages = recentMessages.slice(-3)
    const similarityScore = this.calculateMessageSimilarity(lastThreeMessages)
    
    return similarityScore
  }

  /**
   * Calculates similarity between recent messages to detect stagnation
   */
  private static calculateMessageSimilarity(messages: Message[]): number {
    if (messages.length < 2) return 0
    
    // Simple similarity based on shared words and phrases
    const wordSets = messages.map(msg => 
      new Set(msg.content.toLowerCase().split(/\s+/).filter(word => word.length > 3))
    )
    
    let totalSimilarity = 0
    let comparisons = 0
    
    for (let i = 0; i < wordSets.length - 1; i++) {
      for (let j = i + 1; j < wordSets.length; j++) {
        const intersection = new Set([...wordSets[i]].filter(word => wordSets[j].has(word)))
        const union = new Set([...wordSets[i], ...wordSets[j]])
        const similarity = intersection.size / union.size
        totalSimilarity += similarity
        comparisons++
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0
  }

  /**
   * Generates chain of thought for transparency
   */
  private static generateChainOfThought(analysis: any, action: ModeratorAction, input: ModeratorInput) {
    return {
      timestamp: new Date().toISOString(),
      analysis: {
        messageCount: analysis.messageCount,
        topicDrift: analysis.topicDrift,
        conversationDepth: analysis.conversationDepth,
        stagnationRisk: analysis.stagnationRisk,
        speakerImbalance: analysis.speakerPattern.imbalance
      },
      decisionFactors: {
        primaryTrigger: this.getActionTrigger(action),
        sessionGoal: input.sessionGoal,
        lastSpeaker: input.lastSpeakerId
      },
      selectedAction: action,
      reasoning: this.getActionReasoning(action, analysis)
    }
  }

  /**
   * Gets the primary trigger for an action
   */
  private static getActionTrigger(action: ModeratorAction): string {
    switch (action) {
      case 'DEVILS_ADVOCATE':
        return 'Stagnation detected or need to challenge current thinking'
      case 'SUMMARIZATION':
        return 'Regular interval reached or high conversation depth'
      case 'FLOW_CONTROL':
        return 'Topic drift or speaker imbalance detected'
      case 'SIMPLE_ACKNOWLEDGEMENT':
        return 'Regular acknowledgement interval or low complexity'
      default:
        return 'Unknown trigger'
    }
  }

  /**
   * Gets reasoning for action selection
   */
  private static getActionReasoning(action: ModeratorAction, analysis: any): string {
    switch (action) {
      case 'DEVILS_ADVOCATE':
        return `Stagnation risk: ${analysis.stagnationRisk.toFixed(2)}. Need to challenge and stimulate new thinking.`
      case 'SUMMARIZATION':
        return `Conversation depth: ${analysis.conversationDepth.toFixed(2)}. Time to consolidate progress.`
      case 'FLOW_CONTROL':
        return `Topic drift: ${analysis.topicDrift.toFixed(2)}, Speaker imbalance: ${analysis.speakerPattern.imbalance.toFixed(2)}. Need to redirect focus.`
      case 'SIMPLE_ACKNOWLEDGEMENT':
        return `Low complexity discussion or regular acknowledgement interval. Simple facilitation sufficient.`
      default:
        return 'Standard moderator intervention'
    }
  }
}
