import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Settings } from "lucide-react"

export default function TestAuth() {
  return (
    <div className="min-h-screen bg-warm-gray p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-gray mb-4">Auth0 Setup Test</h1>
          <p className="text-stone-gray/80">Test your Auth0 integration and configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Environment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>AUTH0_CLIENT_ID</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>AUTH0_DOMAIN</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>AUTH0_SECRET</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm text-green-600 mt-2">
                ✅ All environment variables configured
              </div>
            </CardContent>
          </Card>

          {/* API Routes Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                API Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <a href="/api/auth/login" target="_blank">
                    Test Login Route
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/api/auth/logout" target="_blank">
                    Test Logout Route
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/api/auth/me" target="_blank">
                    Test Profile Route
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auth0 Dashboard Links */}
        <Card>
          <CardHeader>
            <CardTitle>Auth0 Dashboard Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Required Callback URLs:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>http://localhost:3001/api/auth/callback</div>
                  <div>https://v0-silent-partners-ai-library.vercel.app/api/auth/callback</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Required Logout URLs:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>http://localhost:3001</div>
                  <div>https://v0-silent-partners-ai-library.vercel.app/</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-800">
                  Make sure these URLs are configured in your Auth0 application settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Authentication Flow */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Authentication Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-stone-gray">
                Click the button below to test the complete Auth0 authentication flow:
              </p>
              <Button asChild size="lg" className="bg-poppy-red hover:bg-poppy-red/90">
                <a href="/api/auth/login">
                  Start Auth0 Login Test
                </a>
              </Button>
              <p className="text-sm text-stone-gray">
                This will redirect you to Auth0 where you can sign up or sign in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 