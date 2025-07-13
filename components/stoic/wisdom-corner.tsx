
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Mountain, 
  Search, 
  Filter, 
  Quote, 
  Clock, 
  Play,
  User,
  MessageCircle,
  Calendar,
  Target,
  Lightbulb,
  Heart,
  Timer,
  CheckCircle,
  BookOpen
} from 'lucide-react'
import { StoicWisdom, WisdomType, StoicWisdomFilters } from '@/lib/types'

export function WisdomCorner() {
  const [allWisdom, setAllWisdom] = useState<StoicWisdom[]>([])
  const [dailyWisdom, setDailyWisdom] = useState<{
    dailyQuote?: StoicWisdom
    dailyReflections: StoicWisdom[]
    practicalExercises: StoicWisdom[]
  }>({
    dailyReflections: [],
    practicalExercises: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedWisdom, setSelectedWisdom] = useState<StoicWisdom | null>(null)
  const [showWisdomDialog, setShowWisdomDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    fetchDailyWisdom()
    fetchAllWisdom()
  }, [])

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchAllWisdom()
    }
  }, [searchTerm, selectedAuthor, selectedType, selectedCategory, activeTab])

  const fetchDailyWisdom = async () => {
    try {
      const response = await fetch('/api/stoic-wisdom/daily')
      if (response.ok) {
        const data = await response.json()
        setDailyWisdom(data)
      }
    } catch (error) {
      console.error('Error fetching daily wisdom:', error)
    }
  }

  const fetchAllWisdom = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedAuthor !== 'all') params.append('author', selectedAuthor)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      const response = await fetch(`/api/stoic-wisdom?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAllWisdom(data.wisdom || [])
      }
    } catch (error) {
      console.error('Error fetching wisdom:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: WisdomType) => {
    switch (type) {
      case 'QUOTE': return Quote
      case 'EXERCISE': return Target
      case 'MEDITATION': return Heart
      case 'REFLECTION': return Lightbulb
      case 'PRINCIPLE': return BookOpen
      case 'PRACTICE': return CheckCircle
      default: return Quote
    }
  }

  const getTypeColor = (type: WisdomType) => {
    switch (type) {
      case 'QUOTE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'EXERCISE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'MEDITATION': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'REFLECTION': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'PRINCIPLE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'PRACTICE': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getUniqueAuthors = () => {
    const authors = allWisdom.map(wisdom => wisdom.author)
    return [...new Set(authors)].sort()
  }

  const getUniqueCategories = () => {
    const categories = allWisdom.map(wisdom => wisdom.category)
    return [...new Set(categories)].sort()
  }

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const addWisdomToConversation = async (wisdomId: string) => {
    // TODO: Implement adding wisdom to current conversation
    console.log('Adding wisdom to conversation:', wisdomId)
  }

  const WisdomCard = ({ wisdom, showFullContent = false }: { wisdom: StoicWisdom, showFullContent?: boolean }) => {
    const TypeIcon = getTypeIcon(wisdom.type)
    
    return (
      <Card 
        className="bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => {
          setSelectedWisdom(wisdom)
          setShowWisdomDialog(true)
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-amber-900 dark:text-amber-100 text-lg leading-tight flex items-center gap-2">
                <TypeIcon className="h-5 w-5" />
                {wisdom.title}
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-400">
                {wisdom.author}
              </CardDescription>
            </div>
            <Badge className={getTypeColor(wisdom.type)}>
              {wisdom.type.toLowerCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800 dark:text-amber-200 text-sm mb-3 italic">
            "{showFullContent ? wisdom.content : (wisdom.content.length > 150 ? wisdom.content.substring(0, 150) + '...' : wisdom.content)}"
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {wisdom.keyThemes?.slice(0, 3).map((theme) => (
              <Badge 
                key={theme} 
                variant="outline"
                className="text-xs border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300"
              >
                {theme}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-4">
              {wisdom.timeToComplete && (
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {wisdom.timeToComplete}m
                </div>
              )}
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Level {wisdom.difficulty}
              </div>
            </div>
            <div className="flex gap-2">
              {wisdom.dailyReflection && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  Daily
                </Badge>
              )}
              {wisdom.practicalExercise && (
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                  Exercise
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
              <Mountain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Wisdom Corner
          </h1>
          <p className="text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
            Discover timeless wisdom through quotes, practical exercises, meditations, and daily reflections 
            from the great Stoic philosophers.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-amber-100 dark:bg-amber-900">
            <TabsTrigger value="daily" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Daily Wisdom
            </TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Quotes
            </TabsTrigger>
            <TabsTrigger value="exercises" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Exercises
            </TabsTrigger>
            <TabsTrigger value="browse" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              Browse All
            </TabsTrigger>
          </TabsList>

          {/* Daily Wisdom Tab */}
          <TabsContent value="daily" className="space-y-6">
            {/* Daily Quote */}
            {dailyWisdom.dailyQuote && (
              <Card className="bg-gradient-to-r from-amber-100 via-stone-50 to-amber-100 dark:from-stone-800 dark:via-amber-900 dark:to-stone-800 border-amber-200 dark:border-amber-700">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Quote of the Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WisdomCard wisdom={dailyWisdom.dailyQuote} showFullContent />
                </CardContent>
              </Card>
            )}

            {/* Daily Reflections */}
            {dailyWisdom.dailyReflections.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Daily Reflections
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {dailyWisdom.dailyReflections.slice(0, 4).map((wisdom) => (
                    <WisdomCard key={wisdom.id} wisdom={wisdom} />
                  ))}
                </div>
              </div>
            )}

            {/* Practical Exercises */}
            {dailyWisdom.practicalExercises.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Practical Exercises
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dailyWisdom.practicalExercises.map((wisdom) => (
                    <WisdomCard key={wisdom.id} wisdom={wisdom} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allWisdom.filter(w => w.type === 'QUOTE').map((wisdom) => (
                <WisdomCard key={wisdom.id} wisdom={wisdom} />
              ))}
            </div>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {allWisdom.filter(w => w.type === 'EXERCISE' || w.type === 'PRACTICE').map((wisdom) => (
                <WisdomCard key={wisdom.id} wisdom={wisdom} />
              ))}
            </div>
          </TabsContent>

          {/* Browse All Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter Wisdom
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search wisdom by title, content, or themes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700"
                  />
                  <Button
                    onClick={fetchAllWisdom}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {getUniqueAuthors().map(author => (
                        <SelectItem key={author} value={author}>{author}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>
                          {formatCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="QUOTE">Quotes</SelectItem>
                      <SelectItem value="EXERCISE">Exercises</SelectItem>
                      <SelectItem value="MEDITATION">Meditations</SelectItem>
                      <SelectItem value="REFLECTION">Reflections</SelectItem>
                      <SelectItem value="PRINCIPLE">Principles</SelectItem>
                      <SelectItem value="PRACTICE">Practices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900">
                    <CardHeader>
                      <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-3/4"></div>
                      <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded"></div>
                        <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : allWisdom.length > 0 ? (
                allWisdom.map((wisdom) => (
                  <WisdomCard key={wisdom.id} wisdom={wisdom} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Mountain className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    No wisdom found
                  </h3>
                  <p className="text-amber-600 dark:text-amber-400">
                    Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Wisdom Detail Dialog */}
        <Dialog open={showWisdomDialog} onOpenChange={setShowWisdomDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-amber-950">
            {selectedWisdom && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-100 text-xl flex items-center gap-2">
                    {(() => {
                      const TypeIcon = getTypeIcon(selectedWisdom.type)
                      return <TypeIcon className="h-6 w-6" />
                    })()}
                    {selectedWisdom.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-amber-600 dark:text-amber-400">
                    <span>{selectedWisdom.author}</span>
                    <span>•</span>
                    <Badge className={getTypeColor(selectedWisdom.type)}>
                      {selectedWisdom.type.toLowerCase()}
                    </Badge>
                    <span>•</span>
                    <span>Level {selectedWisdom.difficulty}</span>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Main Content */}
                  <div className="prose prose-amber dark:prose-invert max-w-none">
                    <blockquote className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/50 p-4 italic text-lg">
                      "{selectedWisdom.content}"
                    </blockquote>
                  </div>

                  {/* Metadata */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Key Themes</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedWisdom.keyThemes?.map((theme) => (
                            <Badge 
                              key={theme} 
                              variant="outline"
                              className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {selectedWisdom.tags && selectedWisdom.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedWisdom.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Details</h4>
                        <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <div>Category: {selectedWisdom.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          <div>Difficulty: Level {selectedWisdom.difficulty}</div>
                          {selectedWisdom.timeToComplete && (
                            <div>Duration: {selectedWisdom.timeToComplete} minutes</div>
                          )}
                          {selectedWisdom.dailyReflection && <div>✓ Daily Reflection</div>}
                          {selectedWisdom.practicalExercise && <div>✓ Practical Exercise</div>}
                        </div>
                      </div>

                      {selectedWisdom.sourceText && (
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Source Text</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            {selectedWisdom.sourceText.title} by {selectedWisdom.sourceText.author}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-amber-200 dark:border-amber-700">
                    <Button
                      onClick={() => addWisdomToConversation(selectedWisdom.id)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Use in Dialogue
                    </Button>
                    {selectedWisdom.practicalExercise && (
                      <Button
                        variant="outline"
                        className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Exercise
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
