
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertCircle, Brain, Crown, Mountain } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

export function LoginScreen() {
  const [passphrase, setPassphrase] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(passphrase)
      
      if (!success) {
        setError('Invalid passphrase. Please try again.')
        setPassphrase('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            HueAndLogic
          </h1>
          <p className="text-slate-400">
            Advanced AI Research & Philosophical Dialogue Platform
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-100 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-400" />
                AI Research Mode
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Access advanced AI reasoning, analysis, and frontier model conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/20 to-stone-800 border-amber-600/30 hover:border-amber-500 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-100 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-amber-400" />
                Stoic Corner
              </CardTitle>
              <CardDescription className="text-amber-300/80 text-sm">
                Engage in philosophical dialogues with ancient Stoic philosophers
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-slate-100 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-slate-400">
              Please enter the passphrase to access the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase" className="text-slate-300">
                  Passphrase
                </Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter your passphrase"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert className="bg-red-900/20 border-red-600 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
                disabled={isLoading || !passphrase.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Access Application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Secure session management • IP-based authentication</p>
        </div>
      </div>
    </div>
  )
}
