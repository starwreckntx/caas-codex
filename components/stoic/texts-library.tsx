
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Globe, 
  User,
  MessageCircle,
  Quote,
  ExternalLink
} from 'lucide-react'
import { StoicText, StoicTextFilters } from '@/lib/types'

export function TextsLibrary() {
  const [texts, setTexts] = useState<StoicText[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')
  const [selectedWork, setSelectedWork] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedText, setSelectedText] = useState<StoicText | null>(null)
  const [showTextDialog, setShowTextDialog] = useState(false)

  useEffect(() => {
    fetchTexts()
  }, [searchTerm, selectedAuthor, selectedWork, selectedCategory, selectedDifficulty])

  const fetchTexts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedAuthor !== 'all') params.append('author', selectedAuthor)
      if (selectedWork !== 'all') params.append('work', selectedWork)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)

      const response = await fetch(`/api/stoic-texts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTexts(data.texts || [])
      }
    } catch (error) {
      console.error('Error fetching texts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUniqueAuthors = () => {
    const authors = texts.map(text => text.author)
    return [...new Set(authors)].sort()
  }

  const getUniqueWorks = () => {
    const works = texts.map(text => text.work)
    return [...new Set(works)].sort()
  }

  const getUniqueCategories = () => {
    const categories = texts.map(text => text.category)
    return [...new Set(categories)].sort()
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 4: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 5: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const addTextToConversation = async (textId: string) => {
    // TODO: Implement adding text to current conversation
    console.log('Adding text to conversation:', textId)
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Stoic Texts Library
          </h1>
          <p className="text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
            Explore authentic writings from the greatest Stoic philosophers. Each text includes historical context, 
            key themes, and difficulty ratings to guide your philosophical journey.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-r from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Texts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search texts by title, content, or themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700"
                />
              </div>
              <Button
                onClick={fetchTexts}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

              <Select value={selectedWork} onValueChange={setSelectedWork}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  <SelectValue placeholder="All Works" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Works</SelectItem>
                  {getUniqueWorks().map(work => (
                    <SelectItem key={work} value={work}>{work}</SelectItem>
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
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-700">
                  <SelectValue placeholder="All Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="1">Beginner (1)</SelectItem>
                  <SelectItem value="2">Intermediate (2)</SelectItem>
                  <SelectItem value="3">Advanced (3)</SelectItem>
                  <SelectItem value="4">Expert (4)</SelectItem>
                  <SelectItem value="5">Master (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : texts.length > 0 ? (
            texts.map((text) => (
              <Card 
                key={text.id} 
                className="bg-gradient-to-br from-amber-50 to-stone-50 dark:from-stone-800 dark:to-amber-900 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedText(text)
                  setShowTextDialog(true)
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-amber-900 dark:text-amber-100 text-lg leading-tight">
                        {text.title}
                      </CardTitle>
                      <CardDescription className="text-amber-600 dark:text-amber-400">
                        {text.author} • {text.work}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(text.difficulty)}>
                      Level {text.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3 line-clamp-3">
                    {text.excerpt || text.content.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {text.keyThemes?.slice(0, 3).map((theme) => (
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
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {text.originalLanguage}
                    </div>
                    {text.bookNumber && text.sectionNumber && (
                      <div>Book {text.bookNumber}, §{text.sectionNumber}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                No texts found
              </h3>
              <p className="text-amber-600 dark:text-amber-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>

        {/* Text Detail Dialog */}
        <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-amber-950">
            {selectedText && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-amber-900 dark:text-amber-100 text-xl">
                    {selectedText.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-amber-600 dark:text-amber-400">
                    <span>{selectedText.author}</span>
                    <span>•</span>
                    <span>{selectedText.work}</span>
                    <span>•</span>
                    <Badge className={getDifficultyColor(selectedText.difficulty)}>
                      Level {selectedText.difficulty}
                    </Badge>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Main Content */}
                  <div className="prose prose-amber dark:prose-invert max-w-none">
                    <blockquote className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/50 p-4 italic">
                      {selectedText.content}
                    </blockquote>
                  </div>

                  {/* Metadata */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Historical Context</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {selectedText.historicalContext || 'No historical context available.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Translation</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {selectedText.translation || 'Translation information not available.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Key Themes</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedText.keyThemes?.map((theme) => (
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

                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Details</h4>
                        <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <div>Original Language: {selectedText.originalLanguage}</div>
                          <div>Category: {selectedText.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          {selectedText.bookNumber && (
                            <div>Book {selectedText.bookNumber}{selectedText.sectionNumber && `, Section ${selectedText.sectionNumber}`}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-amber-200 dark:border-amber-700">
                    <Button
                      onClick={() => addTextToConversation(selectedText.id)}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Use in Dialogue
                    </Button>
                    <Button
                      variant="outline"
                      className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                    >
                      <Quote className="h-4 w-4 mr-2" />
                      Quote Text
                    </Button>
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
