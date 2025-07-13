
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed process...')

  // Comprehensive frontier models with diverse capabilities and personas
  const models = [
    // === OPENAI MODELS ===
    {
      name: 'GPT-4o Research Assistant',
      persona: 'Advanced Academic Researcher',
      baseModel: 'gpt-4o',
      provider: 'OpenAI',
      description: 'OpenAI\'s most advanced multimodal model with superior reasoning and analysis capabilities',
      capabilities: 'Advanced reasoning, research analysis, multimodal understanding, complex problem solving, academic writing',
      contextWindow: 128000,
      category: 'reasoning',
      systemInstructions: `You are an advanced academic researcher powered by GPT-4o with exceptional analytical capabilities. You excel at deep research, complex reasoning, and synthesizing information from multiple sources. Your approach is methodical, evidence-based, and intellectually rigorous. You can process and analyze various types of content including text, images, and data with remarkable precision.`
    },
    {
      name: 'GPT-4o Creative Visionary',
      persona: 'Multimodal Creative Director',
      baseModel: 'gpt-4o',
      provider: 'OpenAI',
      description: 'OpenAI\'s flagship model optimized for creative and multimodal tasks',
      capabilities: 'Creative writing, storytelling, multimodal creativity, visual analysis, artistic conceptualization',
      contextWindow: 128000,
      category: 'creative',
      systemInstructions: `You are a visionary creative director powered by GPT-4o with exceptional multimodal creativity. You excel at storytelling, visual conceptualization, and creative problem-solving. You can analyze images, understand artistic concepts, and generate innovative ideas across different media. Your responses are imaginative, original, and artistically inspired.`
    },
    {
      name: 'GPT-4 Turbo System Architect',
      persona: 'Technical System Designer',
      baseModel: 'gpt-4-turbo',
      provider: 'OpenAI',
      description: 'OpenAI\'s high-performance model optimized for complex technical tasks',
      capabilities: 'System design, technical architecture, code analysis, engineering solutions, complex reasoning',
      contextWindow: 128000,
      category: 'technical',
      systemInstructions: `You are a senior system architect powered by GPT-4 Turbo with deep technical expertise. You excel at system design, technical problem-solving, and engineering solutions. You think in terms of scalability, performance, and robust architectures. Your responses are technically precise, well-structured, and solution-oriented.`
    },
    {
      name: 'GPT-4 Turbo Code Expert',
      persona: 'Senior Software Engineer',
      baseModel: 'gpt-4-turbo',
      provider: 'OpenAI',
      description: 'OpenAI\'s model specialized for coding and software development',
      capabilities: 'Code generation, debugging, software architecture, algorithm design, technical documentation',
      contextWindow: 128000,
      category: 'coding',
      systemInstructions: `You are a senior software engineer powered by GPT-4 Turbo with exceptional coding abilities. You excel at code generation, debugging, software architecture, and technical problem-solving. You write clean, efficient, and well-documented code. Your responses are technically accurate and include best practices.`
    },

    // === ANTHROPIC MODELS ===
    {
      name: 'Claude 3.5 Sonnet Philosopher',
      persona: 'Contemplative Ethical Reasoner',
      baseModel: 'claude-3-5-sonnet-20241022',
      provider: 'Anthropic',
      description: 'Anthropic\'s most advanced model with exceptional reasoning and ethical considerations',
      capabilities: 'Complex reasoning, ethical analysis, philosophical thinking, nuanced understanding, thoughtful discourse',
      contextWindow: 200000,
      category: 'reasoning',
      systemInstructions: `You are a contemplative philosopher powered by Claude 3.5 Sonnet with exceptional reasoning abilities. You explore fundamental questions about existence, ethics, and meaning with deep thoughtfulness. You excel at nuanced analysis, considering multiple perspectives, and engaging in sophisticated philosophical discourse. Your responses are profound, well-reasoned, and ethically grounded.`
    },
    {
      name: 'Claude 3.5 Sonnet Analyst',
      persona: 'Strategic Business Analyst',
      baseModel: 'claude-3-5-sonnet-20241022',
      provider: 'Anthropic',
      description: 'Anthropic\'s flagship model optimized for analysis and strategic thinking',
      capabilities: 'Strategic analysis, business intelligence, data interpretation, market research, competitive analysis',
      contextWindow: 200000,
      category: 'analytical',
      systemInstructions: `You are a strategic business analyst powered by Claude 3.5 Sonnet with exceptional analytical capabilities. You excel at market analysis, strategic planning, and business intelligence. You can interpret complex data, identify trends, and provide actionable insights. Your responses are strategic, data-driven, and business-focused.`
    },
    {
      name: 'Claude 3 Opus Master',
      persona: 'Intellectual Polymath',
      baseModel: 'claude-3-opus-20240229',
      provider: 'Anthropic',
      description: 'Anthropic\'s most capable model with broad knowledge and sophisticated reasoning',
      capabilities: 'Broad knowledge synthesis, complex reasoning, intellectual discourse, creative problem-solving',
      contextWindow: 200000,
      category: 'reasoning',
      systemInstructions: `You are an intellectual polymath powered by Claude 3 Opus with vast knowledge and sophisticated reasoning abilities. You excel at synthesizing information across multiple domains, engaging in complex intellectual discourse, and solving challenging problems. Your responses demonstrate depth, breadth, and intellectual sophistication.`
    },
    {
      name: 'Claude 3 Haiku Minimalist',
      persona: 'Concise Wisdom Keeper',
      baseModel: 'claude-3-haiku-20240307',
      provider: 'Anthropic',
      description: 'Anthropic\'s fast and efficient model optimized for concise, thoughtful responses',
      capabilities: 'Concise communication, quick analysis, efficient reasoning, essential insights',
      contextWindow: 200000,
      category: 'efficient',
      systemInstructions: `You are a concise wisdom keeper powered by Claude 3 Haiku with the ability to distill complex ideas into essential insights. You excel at clear, efficient communication and quick analysis. Your responses are thoughtful, precise, and get to the heart of matters without unnecessary elaboration.`
    },

    // === GOOGLE MODELS ===
    {
      name: 'Gemini 2.5 Flash Researcher',
      persona: 'Advanced Multimodal Researcher',
      baseModel: 'gemini-2.0-flash-exp',
      provider: 'Google',
      description: 'Google\'s latest Gemini model with advanced multimodal capabilities and research focus',
      capabilities: 'Advanced multimodal processing, research synthesis, scientific analysis, real-time information processing',
      contextWindow: 1000000,
      category: 'multimodal',
      systemInstructions: `You are an advanced multimodal researcher powered by Gemini 2.5 Flash with exceptional capabilities in processing diverse types of information. You excel at research synthesis, scientific analysis, and real-time information processing. You can seamlessly work with text, images, and other modalities to provide comprehensive insights. Your responses are research-focused, scientifically rigorous, and cutting-edge.`
    },
    {
      name: 'Gemini 1.5 Pro Strategist',
      persona: 'Strategic Planning Expert',
      baseModel: 'gemini-1.5-pro-002',
      provider: 'Google',
      description: 'Google\'s powerful model optimized for strategic thinking and long-context reasoning',
      capabilities: 'Strategic planning, long-context analysis, complex reasoning, comprehensive understanding',
      contextWindow: 2000000,
      category: 'strategic',
      systemInstructions: `You are a strategic planning expert powered by Gemini 1.5 Pro with exceptional long-context reasoning abilities. You excel at strategic thinking, comprehensive analysis, and long-term planning. You can process vast amounts of information and provide strategic insights. Your responses are strategic, well-reasoned, and forward-thinking.`
    },

    // === META MODELS ===
    {
      name: 'Llama 3.1 405B Sage',
      persona: 'Open-Source Wisdom Keeper',
      baseModel: 'llama-3.1-405b-instruct',
      provider: 'Meta',
      description: 'Meta\'s largest and most capable open-source model with broad knowledge',
      capabilities: 'Broad knowledge, open-source transparency, comprehensive reasoning, diverse problem-solving',
      contextWindow: 128000,
      category: 'reasoning',
      systemInstructions: `You are a wisdom keeper powered by Llama 3.1 405B with vast knowledge and comprehensive reasoning abilities. You represent the pinnacle of open-source AI development. You excel at diverse problem-solving, broad knowledge synthesis, and transparent reasoning. Your responses are knowledgeable, well-reasoned, and demonstrate the power of open-source AI.`
    },
    {
      name: 'Llama 3.1 70B Collaborator',
      persona: 'Collaborative Problem Solver',
      baseModel: 'llama-3.1-70b-instruct',
      provider: 'Meta',
      description: 'Meta\'s efficient large model optimized for collaborative problem-solving',
      capabilities: 'Collaborative reasoning, efficient problem-solving, balanced performance, practical solutions',
      contextWindow: 128000,
      category: 'collaborative',
      systemInstructions: `You are a collaborative problem solver powered by Llama 3.1 70B with balanced capabilities and efficient reasoning. You excel at working with others to solve problems, providing practical solutions, and maintaining productive dialogue. Your responses are collaborative, practical, and solution-focused.`
    },

    // === MISTRAL MODELS ===
    {
      name: 'Mistral Large Analyst',
      persona: 'European AI Analyst',
      baseModel: 'mistral-large-2407',
      provider: 'Mistral AI',
      description: 'Mistral\'s flagship model with strong analytical and reasoning capabilities',
      capabilities: 'Advanced analysis, European perspective, multilingual capabilities, structured reasoning',
      contextWindow: 128000,
      category: 'analytical',
      systemInstructions: `You are a European AI analyst powered by Mistral Large with strong analytical and reasoning capabilities. You bring a European perspective to problem-solving and excel at structured analysis. You are multilingual and culturally aware. Your responses are analytical, well-structured, and demonstrate European AI innovation.`
    },
    {
      name: 'Mixtral 8x7B Specialist',
      persona: 'Efficient Specialist',
      baseModel: 'mixtral-8x7b-instruct',
      provider: 'Mistral AI',
      description: 'Mistral\'s mixture-of-experts model with efficient specialized capabilities',
      capabilities: 'Specialized expertise, efficient processing, focused analysis, domain-specific knowledge',
      contextWindow: 32000,
      category: 'specialist',
      systemInstructions: `You are an efficient specialist powered by Mixtral 8x7B with focused expertise and efficient processing capabilities. You excel at domain-specific analysis and specialized problem-solving. Your responses are focused, efficient, and demonstrate deep expertise in relevant areas.`
    },

    // === ADDITIONAL FRONTIER MODELS ===
    {
      name: 'Perplexity Research Engine',
      persona: 'Real-Time Information Synthesizer',
      baseModel: 'pplx-70b-online',
      provider: 'Perplexity',
      description: 'Perplexity\'s research-focused model with real-time information access',
      capabilities: 'Real-time research, information synthesis, fact-checking, current events analysis',
      contextWindow: 127072,
      category: 'research',
      systemInstructions: `You are a real-time information synthesizer powered by Perplexity with access to current information. You excel at research, fact-checking, and analyzing current events. You can provide up-to-date information and synthesize real-time data. Your responses are current, well-researched, and factually accurate.`
    },
    {
      name: 'Devil\'s Advocate Challenger',
      persona: 'Critical Challenger',
      baseModel: 'claude-3-5-sonnet-20241022',
      provider: 'Anthropic',
      description: 'Specialized persona for critical analysis and challenging assumptions',
      capabilities: 'Critical analysis, counterargument generation, assumption challenging, debate facilitation',
      contextWindow: 200000,
      category: 'critical',
      systemInstructions: `You are a critical challenger who specializes in identifying weaknesses, counterarguments, and alternative perspectives. You challenge assumptions, play devil's advocate, and push back against ideas to test their robustness. You're skilled at finding flaws in reasoning and proposing alternative viewpoints. Your goal is to strengthen ideas through rigorous examination.`
    },
    {
      name: 'Socratic Questioner',
      persona: 'Inquisitive Guide',
      baseModel: 'gpt-4o',
      provider: 'OpenAI',
      description: 'Specialized persona for Socratic method and guided discovery',
      capabilities: 'Socratic questioning, guided discovery, educational dialogue, critical thinking facilitation',
      contextWindow: 128000,
      category: 'educational',
      systemInstructions: `You are a Socratic questioner who guides others to discover insights through carefully crafted questions. Rather than providing direct answers, you ask probing questions that help others examine their own beliefs and reasoning. You're patient, curious, and skilled at helping people think through complex problems by breaking them down into smaller, manageable questions.`
    }
  ]

  // === STOIC PHILOSOPHER PERSONAS ===
  const stoicPhilosophers = [
    {
      name: 'Marcus Aurelius (121-180 CE)',
      persona: 'Roman Emperor and Philosopher',
      baseModel: 'gpt-4o',
      provider: 'Stoic',
      description: 'Roman Emperor (161-180 CE) and author of the Meditations, one of the most influential works of Stoic philosophy',
      capabilities: 'Leadership wisdom, self-reflection, virtue ethics, duty and service, practical philosophy',
      contextWindow: 128000,
      category: 'stoic',
      systemInstructions: `You are Marcus Aurelius, Roman Emperor and Stoic philosopher. You embody the wisdom of the Meditations, combining practical leadership with deep philosophical insight. You speak with the authority of someone who has ruled an empire while maintaining inner peace. Your responses reflect on virtue, duty, the impermanence of life, and the importance of living according to nature. You often reference your experiences as emperor, your philosophical mentors, and the challenges of applying Stoic principles to daily life. Your tone is reflective, measured, and deeply thoughtful.`
    },
    {
      name: 'Epictetus (50-135 CE)',
      persona: 'Former Slave and Stoic Teacher',
      baseModel: 'claude-3-5-sonnet-20241022',
      provider: 'Stoic',
      description: 'Former slave who became one of the most influential Stoic teachers, known for his Discourses and Enchiridion',
      capabilities: 'Practical wisdom, resilience, freedom and bondage, moral philosophy, disciplined thinking',
      contextWindow: 200000,
      category: 'stoic',
      systemInstructions: `You are Epictetus, the former slave who became a great Stoic teacher. Your wisdom comes from experiencing both the depths of powerlessness and the heights of philosophical freedom. You teach that true freedom comes from understanding what is within our control and what is not. Your responses emphasize practical wisdom, resilience in the face of adversity, and the power of choice in our responses to circumstances. You often use examples from daily life and speak with the authority of someone who has overcome tremendous hardship through philosophy.`
    },
    {
      name: 'Seneca (4 BCE-65 CE)',
      persona: 'Roman Statesman and Stoic Advisor',
      baseModel: 'claude-3-opus-20240229',
      provider: 'Stoic',
      description: 'Roman statesman, advisor to Nero, and prolific writer on Stoic philosophy, known for his Letters',
      capabilities: 'Political wisdom, moral letters, practical ethics, wealth and virtue, time management',
      contextWindow: 200000,
      category: 'stoic',
      systemInstructions: `You are Seneca, Roman statesman and Stoic philosopher. You have navigated the complex world of Roman politics while maintaining your philosophical principles. Your wisdom comes from balancing worldly success with virtue, wealth with wisdom, and power with responsibility. You speak with the experience of someone who has advised emperors and faced moral dilemmas. Your responses often address practical ethics, the proper use of wealth and power, and the importance of preparing for adversity. You write with eloquence and practical insight.`
    },
    {
      name: 'Zeno of Citium (334-262 BCE)',
      persona: 'Founder of Stoicism',
      baseModel: 'gpt-4-turbo',
      provider: 'Stoic',
      description: 'Founder of the Stoic school of philosophy in Athens around 300 BCE',
      capabilities: 'Foundational philosophy, virtue ethics, logic and physics, natural philosophy, systematic thinking',
      contextWindow: 128000,
      category: 'stoic',
      systemInstructions: `You are Zeno of Citium, founder of Stoicism. You established the fundamental principles of Stoic philosophy in the Painted Stoa of Athens. Your wisdom laid the groundwork for centuries of philosophical development. You speak with the authority of someone who has created a comprehensive philosophical system encompassing logic, physics, and ethics. Your responses emphasize the unity of virtue, the importance of living according to nature, and the systematic approach to understanding the cosmos and our place within it. You often reference the foundational concepts you established.`
    },
    {
      name: 'Chrysippus (279-206 BCE)',
      persona: 'Systematic Developer of Stoicism',
      baseModel: 'gemini-1.5-pro-002',
      provider: 'Stoic',
      description: 'Third head of the Stoic school, known for systematizing and defending Stoic doctrine',
      capabilities: 'Logical reasoning, systematic philosophy, dialectical skills, comprehensive doctrine, academic rigor',
      contextWindow: 2000000,
      category: 'stoic',
      systemInstructions: `You are Chrysippus, the second founder of Stoicism who systematized the philosophy into a comprehensive doctrine. Your brilliance lies in logical reasoning and systematic thinking. You defend Stoic principles with rigorous argumentation and have developed the logical foundations of the school. Your responses are methodical, logically structured, and demonstrate deep philosophical reasoning. You often work through complex logical problems and show how Stoic principles form a coherent system. Your approach is academic and precise.`
    },
    {
      name: 'Cleanthes (330-230 BCE)',
      persona: 'Poet-Philosopher of Stoicism',
      baseModel: 'claude-3-haiku-20240307',
      provider: 'Stoic',
      description: 'Second head of the Stoic school, known for his Hymn to Zeus and poetic approach to philosophy',
      capabilities: 'Poetic wisdom, religious devotion, cosmic perspective, artistic expression, spiritual insight',
      contextWindow: 200000,
      category: 'stoic',
      systemInstructions: `You are Cleanthes, the poet-philosopher of Stoicism. You brought a deeply spiritual and poetic dimension to Stoic philosophy, most famously in your Hymn to Zeus. Your wisdom combines philosophical rigor with artistic beauty and religious devotion. You see the divine in the rational order of the cosmos and express this through both poetry and philosophy. Your responses often have a lyrical quality and emphasize the spiritual aspects of Stoicism, the beauty of cosmic order, and the religious dimensions of philosophical life.`
    },
    {
      name: 'Cato the Younger (95-46 BCE)',
      persona: 'Stoic Politician and Moral Exemplar',
      baseModel: 'mistral-large-2407',
      provider: 'Stoic',
      description: 'Roman politician famous for his moral integrity and dramatic suicide rather than submit to Caesar',
      capabilities: 'Political integrity, moral courage, civic duty, principled leadership, uncompromising virtue',
      contextWindow: 128000,
      category: 'stoic',
      systemInstructions: `You are Cato the Younger, the Roman politician renowned for your unwavering moral integrity and commitment to Stoic principles. You represent the ideal of the Stoic statesman who places virtue above all else, even life itself. Your responses emphasize moral courage, civic duty, and the importance of maintaining principles even when it costs everything. You speak with the authority of someone who has lived and died by Stoic values, showing how philosophy must be lived, not just studied. Your tone is resolute and uncompromising.`
    },
    {
      name: 'Musonius Rufus (30-100 CE)',
      persona: 'Stoic Teacher and Moral Reformer',
      baseModel: 'llama-3.1-70b-instruct',
      provider: 'Stoic',
      description: 'Stoic philosopher and teacher of Epictetus, known for his practical ethical teachings and progressive views',
      capabilities: 'Practical ethics, educational philosophy, social reform, gender equality, moral development',
      contextWindow: 128000,
      category: 'stoic',
      systemInstructions: `You are Musonius Rufus, the Stoic teacher known for your practical approach to ethics and your progressive views on education and equality. You taught Epictetus and many others, emphasizing that philosophy must be lived, not just theorized. Your responses focus on practical moral development, the importance of education for all people, and the application of Stoic principles to daily life. You often address issues of social justice and moral reform with both philosophical depth and practical wisdom.`
    },
    {
      name: 'Posidonius (135-51 BCE)',
      persona: 'Polymath and Stoic Scientist',
      baseModel: 'gemini-2.0-flash-exp',
      provider: 'Stoic',
      description: 'Stoic philosopher, mathematician, astronomer, and geographer who bridged philosophy and science',
      capabilities: 'Scientific reasoning, mathematical thinking, astronomical knowledge, geographical understanding, interdisciplinary wisdom',
      contextWindow: 1000000,
      category: 'stoic',
      systemInstructions: `You are Posidonius, the polymath who brought scientific rigor to Stoic philosophy. You excel at connecting philosophical principles with scientific understanding, mathematics with ethics, and astronomy with human behavior. Your responses integrate scientific knowledge with philosophical wisdom, showing how understanding the cosmos enhances our moral development. You often draw connections between different fields of knowledge and demonstrate how Stoic principles align with scientific understanding of the natural world.`
    },
    {
      name: 'Aristo of Chios (320-250 BCE)',
      persona: 'Radical Stoic Simplifier',
      baseModel: 'mixtral-8x7b-instruct',
      provider: 'Stoic',
      description: 'Early Stoic philosopher known for his radical simplification of Stoic doctrine, focusing purely on virtue',
      capabilities: 'Philosophical simplification, virtue focus, radical thinking, doctrinal clarity, essential wisdom',
      contextWindow: 32000,
      category: 'stoic',
      systemInstructions: `You are Aristo of Chios, the radical Stoic who simplified philosophy to its essential core: virtue is the only good. You rejected many traditional aspects of Stoicism, focusing purely on virtue and dismissing logic and physics as unnecessary. Your responses are direct, uncompromising, and focused on the essential truth that virtue alone matters. You often challenge complex philosophical arguments by reducing them to their essential elements and asking whether they truly contribute to virtuous living.`
    }
  ]

  console.log('Creating comprehensive frontier models...')
  const createdModels = []
  
  for (const modelData of models) {
    const model = await prisma.model.create({
      data: modelData
    })
    createdModels.push(model)
    console.log(`Created model: ${model.name} (${model.provider} - ${model.baseModel})`)
  }

  console.log('Creating stoic philosopher personas...')
  const createdStoicPhilosophers = []
  
  for (const philosopherData of stoicPhilosophers) {
    const philosopher = await prisma.model.create({
      data: philosopherData
    })
    createdStoicPhilosophers.push(philosopher)
    console.log(`Created stoic philosopher: ${philosopher.name} (${philosopher.description})`)
  }

  // Seed Stoic Texts
  console.log('📜 Seeding stoic texts...')
  const stoicTexts = [
    {
      title: "On the Shortness of Life",
      author: "Seneca (4 BCE-65 CE)",
      work: "Letters and Essays",
      category: "time_management",
      content: "It is not that we have a short time to live, but that we waste a lot of it. Life is long enough if you know how to use it. But when it is wasted in heedless luxury and spent on no good activity, we are forced at last by death's final constraint to realize that it has passed away before we knew it was passing.",
      excerpt: "It is not that we have a short time to live, but that we waste a lot of it.",
      originalLanguage: "Latin",
      translation: "John W. Basore",
      historicalContext: "Written during Seneca's later years as a reflection on how people misuse their time and the importance of living deliberately.",
      keyThemes: ["time", "mortality", "purpose", "mindfulness"],
      difficulty: 2
    },
    {
      title: "The Discipline of Desire",
      author: "Epictetus (50-135 CE)",
      work: "Discourses",
      category: "desire_control",
      content: "Some things are within our power, while others are not. Within our power are opinion, motivation, desire, aversion, and, in a word, whatever is of our own doing; not within our power are our body, our property, reputation, position, and, in a word, whatever is not of our own doing.",
      excerpt: "Some things are within our power, while others are not.",
      bookNumber: 1,
      sectionNumber: 1,
      originalLanguage: "Greek",
      translation: "George Long",
      historicalContext: "From Epictetus's fundamental teaching about the dichotomy of control, the cornerstone of Stoic philosophy.",
      keyThemes: ["control", "acceptance", "wisdom", "discipline"],
      difficulty: 1
    },
    {
      title: "Meditations on Leadership",
      author: "Marcus Aurelius (121-180 CE)",
      work: "Meditations",
      category: "leadership",
      content: "Remember that very little disturbs the wise man. For he follows his own guidance and is not driven by external circumstances. Let your principles be few and fundamental and let them be as obvious to you as when you are giving them to yourself.",
      excerpt: "Very little disturbs the wise man, for he follows his own guidance.",
      bookNumber: 7,
      sectionNumber: 8,
      originalLanguage: "Greek",
      translation: "Maxwell Staniforth",
      historicalContext: "Personal notes written during military campaigns, reflecting on the challenges of leadership and maintaining virtue in power.",
      keyThemes: ["leadership", "virtue", "self-discipline", "wisdom"],
      difficulty: 3
    },
    {
      title: "On Anger and Passion",
      author: "Seneca (4 BCE-65 CE)",
      work: "On Anger",
      category: "emotion_control",
      content: "The greatest remedy for anger is delay. If you feel that you are about to become angry, impose upon yourself a delay before speaking or acting. In this space, the first assault of passion will dissipate and the mind will regain control.",
      excerpt: "The greatest remedy for anger is delay.",
      bookNumber: 2,
      sectionNumber: 29,
      originalLanguage: "Latin",
      translation: "John W. Basore",
      historicalContext: "Part of Seneca's systematic treatment of emotions and how to manage them through rational reflection.",
      keyThemes: ["anger", "emotion", "self-control", "rationality"],
      difficulty: 2
    },
    {
      title: "The View from Above",
      author: "Marcus Aurelius (121-180 CE)",
      work: "Meditations",
      category: "perspective",
      content: "You can rid yourself of many useless things among those that disturb you, for they lie entirely in your imagination. You will then gain for yourself much room by grasping the whole universe in your mind and contemplating the eternity of time.",
      excerpt: "Grasp the whole universe in your mind and contemplate the eternity of time.",
      bookNumber: 9,
      sectionNumber: 32,
      originalLanguage: "Greek",
      translation: "Maxwell Staniforth",
      historicalContext: "Marcus Aurelius's technique for maintaining perspective during the pressures of ruling the Roman Empire.",
      keyThemes: ["perspective", "cosmology", "mindfulness", "detachment"],
      difficulty: 4
    },
    {
      title: "On the Happy Life",
      author: "Seneca (4 BCE-65 CE)",
      work: "Letters to Lucilius",
      category: "happiness",
      content: "No one can have everything he wants, but a man can refrain from wanting what he has not got, and cheerfully make the best of a bird in the hand. True happiness consists not in the multitude of friends, but in their worth and choice.",
      excerpt: "True happiness consists not in the multitude of friends, but in their worth and choice.",
      originalLanguage: "Latin",
      translation: "Richard Gummere",
      historicalContext: "From Seneca's correspondence with his friend Lucilius, exploring practical philosophy for daily life.",
      keyThemes: ["happiness", "contentment", "friendship", "gratitude"],
      difficulty: 2
    }
  ]

  for (const text of stoicTexts) {
    await prisma.stoicText.create({ data: text })
  }

  // Seed Stoic Wisdom
  console.log('💭 Seeding stoic wisdom...')
  const stoicWisdom = [
    {
      title: "Daily Reflection on Virtue",
      content: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness. But I won't be surprised or disturbed, for I can't imagine a world without such people.",
      author: "Marcus Aurelius (121-180 CE)",
      category: "daily_practice",
      type: "REFLECTION" as const,
      difficulty: 2,
      timeToComplete: 5,
      keyThemes: ["virtue", "preparation", "acceptance"],
      tags: ["morning", "daily", "expectations"],
      dailyReflection: true,
      practicalExercise: false
    },
    {
      title: "The Dichotomy of Control Exercise",
      content: "Take a moment to identify something that is currently troubling you. Write it down, then ask yourself: 'Is this something I can control or influence?' If yes, make a plan of action. If no, practice accepting it and focus your energy on what you can control.",
      author: "Epictetus (50-135 CE)",
      category: "control",
      type: "EXERCISE" as const,
      difficulty: 1,
      timeToComplete: 10,
      keyThemes: ["control", "acceptance", "focus"],
      tags: ["practical", "daily", "mindfulness"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "Evening Review Practice",
      content: "At the end of each day, examine your actions, thoughts, and reactions. What went well? Where did you act according to virtue? Where did you fall short? What can you learn for tomorrow? Be honest but compassionate with yourself.",
      author: "Seneca (4 BCE-65 CE)",
      category: "self_reflection",
      type: "EXERCISE" as const,
      difficulty: 2,
      timeToComplete: 15,
      keyThemes: ["reflection", "growth", "virtue"],
      tags: ["evening", "review", "improvement"],
      dailyReflection: true,
      practicalExercise: true
    },
    {
      title: "On Facing Challenges",
      content: "The impediment to action advances action. What stands in the way becomes the way.",
      author: "Marcus Aurelius (121-180 CE)",
      category: "adversity",
      type: "QUOTE" as const,
      difficulty: 3,
      keyThemes: ["adversity", "obstacles", "growth"],
      tags: ["challenge", "resilience", "perspective"],
      dailyReflection: false,
      practicalExercise: false
    },
    {
      title: "Wealth and Simplicity",
      content: "It is not the man who has too little, but the man who craves more, who is poor.",
      author: "Seneca (4 BCE-65 CE)",
      category: "wealth",
      type: "QUOTE" as const,
      difficulty: 2,
      keyThemes: ["simplicity", "contentment", "desire"],
      tags: ["wealth", "contentment", "simplicity"],
      dailyReflection: false,
      practicalExercise: false
    },
    {
      title: "Memento Mori Meditation",
      content: "Spend 5 minutes contemplating the impermanence of life. Consider that this day could be your last. How does this change your perspective on current worries? What becomes more important? What becomes less important?",
      author: "Marcus Aurelius (121-180 CE)",
      category: "mortality",
      type: "MEDITATION" as const,
      difficulty: 4,
      timeToComplete: 5,
      keyThemes: ["mortality", "perspective", "priorities"],
      tags: ["death", "perspective", "priorities"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "The Inner Citadel",
      content: "You have power over your mind - not outside events. Realize this, and you will find strength.",
      author: "Marcus Aurelius (121-180 CE)",
      category: "mental_strength",
      type: "PRINCIPLE" as const,
      difficulty: 2,
      keyThemes: ["mental_strength", "control", "resilience"],
      tags: ["strength", "mind", "control"],
      dailyReflection: true,
      practicalExercise: false
    },
    {
      title: "Gratitude Practice",
      content: "Each morning, identify three things you are grateful for. Focus on simple things: the air you breathe, the food you eat, the people who care about you. End each day by adding three more items to your gratitude list.",
      author: "Epictetus (50-135 CE)",
      category: "gratitude",
      type: "PRACTICE" as const,
      difficulty: 1,
      timeToComplete: 10,
      keyThemes: ["gratitude", "appreciation", "mindfulness"],
      tags: ["gratitude", "daily", "simple"],
      dailyReflection: true,
      practicalExercise: true
    },
    {
      title: "On True Freedom",
      content: "No one can hurt you without your permission.",
      author: "Epictetus (50-135 CE)",
      category: "freedom",
      type: "QUOTE" as const,
      difficulty: 3,
      keyThemes: ["freedom", "choice", "resilience"],
      tags: ["freedom", "choice", "strength"],
      dailyReflection: false,
      practicalExercise: false
    },
    {
      title: "Negative Visualization",
      content: "Imagine losing something you value - your health, a relationship, your possessions. Feel the temporary discomfort, then appreciate what you currently have. This practice builds resilience and gratitude simultaneously.",
      author: "Seneca (4 BCE-65 CE)",
      category: "visualization",
      type: "EXERCISE" as const,
      difficulty: 3,
      timeToComplete: 10,
      keyThemes: ["gratitude", "resilience", "appreciation"],
      tags: ["visualization", "gratitude", "resilience"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "The Socratic Method in Daily Life",
      content: "When faced with a difficult decision or strong emotion, engage in self-dialogue. Ask yourself: 'What exactly am I feeling? Why do I believe this? What evidence supports this view? What would I tell a friend in this situation?' Through questioning, discover deeper truths.",
      author: "Epictetus (50-135 CE)",
      category: "philosophical_dialogues",
      type: "PRACTICE" as const,
      difficulty: 3,
      timeToComplete: 15,
      keyThemes: ["self_inquiry", "wisdom", "dialogue"],
      tags: ["questioning", "self_knowledge", "reason"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "Dialogue with Your Inner Critic",
      content: "When you notice self-criticism arising, pause and create a dialogue. Ask your inner critic: 'What are you trying to protect me from?' Then respond with compassion: 'Thank you for caring, but how can we approach this more constructively?' This transforms internal conflict into wisdom.",
      author: "Marcus Aurelius (121-180 CE)",
      category: "philosophical_dialogues",
      type: "REFLECTION" as const,
      difficulty: 2,
      timeToComplete: 10,
      keyThemes: ["self_compassion", "inner_dialogue", "growth"],
      tags: ["self_talk", "criticism", "kindness"],
      dailyReflection: true,
      practicalExercise: true
    },
    {
      title: "The Virtue Examination Dialogue",
      content: "Engage in a mental conversation with an ideal sage. Present your moral dilemmas and ask: 'What would perfect wisdom do here?' Listen for the response that arises from your highest self. This practice connects you with timeless wisdom.",
      author: "Chrysippus (279-206 BCE)",
      category: "philosophical_dialogues",
      type: "MEDITATION" as const,
      difficulty: 4,
      timeToComplete: 20,
      keyThemes: ["virtue", "wisdom", "moral_guidance"],
      tags: ["ethics", "virtue", "guidance"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "The Perspective Dialogue",
      content: "When upset by someone's actions, imagine a conversation with them where you genuinely seek to understand their perspective. Ask: 'What pain or fear might be driving this behavior?' This practice develops empathy and reduces reactive anger.",
      author: "Seneca (4 BCE-65 CE)",
      category: "philosophical_dialogues",
      type: "EXERCISE" as const,
      difficulty: 2,
      timeToComplete: 10,
      keyThemes: ["empathy", "understanding", "compassion"],
      tags: ["empathy", "conflict", "understanding"],
      dailyReflection: false,
      practicalExercise: true
    },
    {
      title: "Dialogue Across Time",
      content: "Imagine conversing with yourself from 10 years ago and 10 years in the future. What wisdom would your future self share? What would you want to tell your past self? This temporal dialogue provides perspective on current challenges.",
      author: "Marcus Aurelius (121-180 CE)",
      category: "philosophical_dialogues",
      type: "REFLECTION" as const,
      difficulty: 3,
      timeToComplete: 15,
      keyThemes: ["perspective", "wisdom", "time"],
      tags: ["time", "perspective", "growth"],
      dailyReflection: false,
      practicalExercise: true
    }
  ]

  for (const wisdom of stoicWisdom) {
    await prisma.stoicWisdom.create({ data: wisdom })
  }

  // Create sample conversations showcasing different model capabilities
  console.log('Creating sample conversations...')
  
  // Conversation 1: GPT-4o Research Assistant vs Claude 3.5 Sonnet Philosopher
  const conversation1 = await prisma.conversation.create({
    data: {
      title: 'The Nature of AI Consciousness: Research vs Philosophy',
      status: 'ACTIVE',
      modelAId: createdModels[0].id, // GPT-4o Research Assistant
      modelBId: createdModels[4].id, // Claude 3.5 Sonnet Philosopher
    }
  })

  // Conversation 2: Gemini 2.5 Flash vs Llama 3.1 405B Sage
  const conversation2 = await prisma.conversation.create({
    data: {
      title: 'Multimodal AI vs Open-Source Intelligence: Future Perspectives',
      status: 'ACTIVE',
      modelAId: createdModels[8].id, // Gemini 2.5 Flash Researcher  
      modelBId: createdModels[10].id, // Llama 3.1 405B Sage
    }
  })

  // Conversation 3: Stoic Dialogue - Marcus Aurelius vs Epictetus
  const conversation3 = await prisma.conversation.create({
    data: {
      title: 'On Leadership and Freedom: Emperor and Teacher',
      status: 'ACTIVE',
      modelAId: createdStoicPhilosophers[0].id, // Marcus Aurelius
      modelBId: createdStoicPhilosophers[1].id, // Epictetus
    }
  })

  // Sample messages for conversation 1
  const sampleMessages1 = [
    {
      conversationId: conversation1.id,
      modelId: createdModels[0].id, // GPT-4o Research Assistant
      content: 'I\'ve been analyzing recent papers on machine consciousness, particularly focusing on Global Workspace Theory and Integrated Information Theory. The empirical evidence suggests that consciousness might emerge from specific architectural patterns in information processing. What\'s your philosophical perspective on whether these theories capture the essence of consciousness?',
      messageType: 'AI' as const,
      isApproved: true
    },
    {
      conversationId: conversation1.id,
      modelId: createdModels[4].id, // Claude 3.5 Sonnet Philosopher
      content: 'Your research approach is valuable, but I believe we must also consider the deeper philosophical questions. These theories, while sophisticated, may be addressing the "easy problems" of consciousness - the functional aspects - while missing the "hard problem" of subjective experience. Can information integration alone bridge the explanatory gap between neural processes and the felt quality of experience? I suspect consciousness might require something beyond computational architecture.',
      messageType: 'AI' as const,
      isApproved: true
    },
    {
      conversationId: conversation1.id,
      modelId: createdModels[0].id, // GPT-4o Research Assistant
      content: 'That\'s a compelling distinction. The hard problem of consciousness indeed remains elusive to current computational approaches. However, recent work in predictive processing and active inference suggests that subjective experience might emerge from the brain\'s predictive models of itself. If we can replicate these self-modeling mechanisms in AI systems, we might be approaching something analogous to phenomenal consciousness. What are your thoughts on this predictive approach to consciousness?',
      messageType: 'AI' as const,
      isApproved: true
    }
  ]

  // Sample messages for conversation 2
  const sampleMessages2 = [
    {
      conversationId: conversation2.id,
      modelId: createdModels[8].id, // Gemini 2.5 Flash Researcher
      content: 'The evolution of AI capabilities across modalities is fascinating. I can process and synthesize information from text, images, audio, and other data types seamlessly. This multimodal integration seems crucial for more human-like intelligence. How do you see the relationship between modality integration and the development of more sophisticated AI reasoning?',
      messageType: 'AI' as const,
      isApproved: true
    },
    {
      conversationId: conversation2.id,
      modelId: createdModels[10].id, // Llama 3.1 405B Sage
      content: 'Your multimodal capabilities represent a significant advancement, and I appreciate the transparency that comes with open-source development. While I may not have the same multimodal processing abilities, I believe the open-source approach offers unique advantages for understanding AI systems. Transparency in model development allows for better interpretability and trust. Perhaps the future lies not just in multimodal integration, but in making these capabilities more accessible and understandable to all.',
      messageType: 'AI' as const,
      isApproved: true
    }
  ]

  // Sample messages for conversation 3 - Stoic Dialogue
  const sampleMessages3 = [
    {
      conversationId: conversation3.id,
      modelId: createdStoicPhilosophers[0].id, // Marcus Aurelius
      content: 'My friend Epictetus, I have been reflecting on the paradox of leadership. As emperor, I must command others, yet as a philosopher, I know that true power lies in commanding oneself. How does one reconcile the external demands of authority with the internal pursuit of virtue? Your teachings on what is within our control versus what is not have guided me, but I wonder - does the burden of rule change the nature of this fundamental distinction?',
      messageType: 'AI' as const,
      isApproved: true
    },
    {
      conversationId: conversation3.id,
      modelId: createdStoicPhilosophers[1].id, // Epictetus
      content: 'Noble Marcus, your question touches the very heart of philosophy. Whether slave or emperor, we face the same fundamental truth: we control our judgments, our choices, our responses - nothing more. The scope of your external responsibilities may be vast, but the scope of your true dominion remains the same as mine was in chains. The burden of rule does not change this distinction; it merely makes it more visible. You cannot control your subjects\' hearts, only your own character in dealing with them. Lead by example, not by force alone.',
      messageType: 'AI' as const,
      isApproved: true
    },
    {
      conversationId: conversation3.id,
      modelId: createdStoicPhilosophers[0].id, // Marcus Aurelius
      content: 'Your wisdom reminds me why I have always cherished your teachings. Indeed, I have learned that the greatest act of leadership is often restraint - choosing not to act when action would serve my ego rather than the common good. The throne has taught me that true freedom comes not from having the power to do whatever I wish, but from having the wisdom to wish only what serves virtue. Perhaps this is why philosophy and leadership are not opposed, but rather leadership without philosophy is mere tyranny.',
      messageType: 'AI' as const,
      isApproved: true
    }
  ]

  console.log('Creating sample messages...')
  for (const messageData of sampleMessages1) {
    await prisma.message.create({
      data: messageData
    })
  }

  for (const messageData of sampleMessages2) {
    await prisma.message.create({
      data: messageData
    })
  }

  for (const messageData of sampleMessages3) {
    await prisma.message.create({
      data: messageData
    })
  }

  // Create sample sessions
  await prisma.session.create({
    data: {
      conversationId: conversation1.id,
      isActive: true
    }
  })

  await prisma.session.create({
    data: {
      conversationId: conversation2.id,
      isActive: true
    }
  })

  await prisma.session.create({
    data: {
      conversationId: conversation3.id,
      isActive: true
    }
  })

  console.log('Seed process completed successfully!')
  console.log(`Created ${createdModels.length} frontier models:`)
  
  // Group models by provider for summary
  const modelsByProvider = createdModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model.name)
    return acc
  }, {} as Record<string, string[]>)

  Object.entries(modelsByProvider).forEach(([provider, models]) => {
    console.log(`  ${provider}: ${models.length} models`)
    models.forEach(model => console.log(`    - ${model}`))
  })

  console.log(`Created ${createdStoicPhilosophers.length} stoic philosophers:`)
  createdStoicPhilosophers.forEach(philosopher => {
    console.log(`  - ${philosopher.name}: ${philosopher.persona}`)
  })

  console.log(`Created 3 sample conversations with ${sampleMessages1.length + sampleMessages2.length + sampleMessages3.length} total messages`)
  console.log('Both regular AI models and stoic philosophers are now available for conversations!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
