
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Scroll, Mountain, Flame, BookOpen, MessageCircle, Users, Quote, Target } from 'lucide-react'
import { useState } from 'react'
import { NewStoicConversationModal } from './new-stoic-conversation-modal'
import { RoundTableModal } from './round-table-modal'

type StoicSection = 'conversations' | 'texts' | 'wisdom'

interface StoicWelcomeProps {
  onNavigate?: (section: StoicSection) => void
}

export function StoicWelcome({ onNavigate }: StoicWelcomeProps) {
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isRoundTableOpen, setIsRoundTableOpen] = useState(false)

  const philosophers = [
    {
      name: 'Marcus Aurelius',
      title: 'The Philosopher Emperor',
      icon: Crown,
      quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      description: 'Roman Emperor who practiced Stoicism while ruling the vast empire.'
    },
    {
      name: 'Epictetus',
      title: 'The Liberated Teacher',
      icon: Scroll,
      quote: 'No one can hurt you without your permission.',
      description: 'Former slave who became one of the greatest Stoic teachers.'
    },
    {
      name: 'Seneca',
      title: 'The Practical Stoic',
      icon: BookOpen,
      quote: 'Every moment we encounter is a lesson for us.',
      description: 'Roman statesman who balanced worldly success with virtue.'
    }
  ]

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
                <Mountain className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-4">
              Welcome to the Stoic Corner
            </h1>
            
            <p className="text-xl text-amber-700 dark:text-amber-300 mb-8 max-w-3xl mx-auto">
              Engage in philosophical dialogues with the greatest minds of Stoicism. 
              Explore wisdom, virtue, and the art of living well through conversations 
              between ancient philosophers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setIsNewConversationOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Begin Philosophical Dialogue
              </Button>

              <Button
                onClick={() => setIsRoundTableOpen(true)}
                variant="outline"
                size="lg"
                className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <Users className="h-5 w-5 mr-2" />
                Start Round Table
              </Button>
              
              <Button
                onClick={() => onNavigate?.('texts')}
                variant="outline"
                size="lg"
                className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Explore Stoic Texts
              </Button>
            </div>
          </div>

          {/* Featured Philosophers */}
          <div className="grid md:grid-cols-3 gap-6">
            {philosophers.map((philosopher) => {
              const Icon = philosopher.icon
              return (
                <Card key={philosopher.name} className="bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                      {philosopher.name}
                    </CardTitle>
                    <CardDescription className="text-amber-600 dark:text-amber-400">
                      {philosopher.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <blockquote className="text-sm text-amber-800 dark:text-amber-200 italic mb-3">
                      "{philosopher.quote}"
                    </blockquote>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {philosopher.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Enhanced Features */}
          <Card className="bg-gradient-to-r from-amber-100 via-stone-50 to-amber-100 dark:from-stone-800 dark:via-amber-900 dark:to-stone-800 border-amber-200 dark:border-amber-700">
            <CardHeader>
              <CardTitle className="text-center text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2">
                <Flame className="h-6 w-6" />
                Enhanced Philosophical Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Card 
                  className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => onNavigate?.('texts')}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">Stoic Texts</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Explore authentic writings from Marcus Aurelius, Seneca, Epictetus, and other Stoic masters with historical context and translations.
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => onNavigate?.('wisdom')}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                        <Mountain className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">Wisdom Corner</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Daily quotes, practical exercises, meditations, and reflections to apply Stoic wisdom in your daily life.
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setIsRoundTableOpen(true)}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">Round Tables</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Host discussions with multiple philosophers simultaneously, with options for human participation and moderation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Stoic Principles */}
          <Card className="bg-gradient-to-r from-amber-100 via-stone-50 to-amber-100 dark:from-stone-800 dark:via-amber-900 dark:to-stone-800 border-amber-200 dark:border-amber-700">
            <CardHeader>
              <CardTitle className="text-center text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2">
                <Quote className="h-6 w-6" />
                Core Stoic Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Wisdom</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    The pursuit of knowledge and understanding of the world
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Justice</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Acting with fairness and integrity towards others
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Courage</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Facing challenges with bravery and determination
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Temperance</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Practicing self-control and moderation in all things
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Stoic Reflection */}
          <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                <Scroll className="h-5 w-5" />
                Daily Stoic Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-amber-800 dark:text-amber-200 italic text-lg mb-3">
                "The happiness of your life depends upon the quality of your thoughts: 
                therefore, guard accordingly, and take care that you entertain no notions 
                unsuitable to virtue and reasonable nature."
              </blockquote>
              <cite className="text-amber-600 dark:text-amber-400 text-sm">
                — Marcus Aurelius, Meditations
              </cite>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewStoicConversationModal
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
      />

      <RoundTableModal
        open={isRoundTableOpen}
        onOpenChange={setIsRoundTableOpen}
      />
    </>
  )
}
