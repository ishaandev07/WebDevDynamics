import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Zap, Shield, Bot } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Rocket className="text-blue-600 text-2xl mr-3" />
              <span className="text-xl font-bold text-slate-900">DeployBot</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Smart Deployment Made{" "}
            <span className="text-blue-600">Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Upload your code, get AI-powered deployment guidance, and deploy to any server with confidence. 
            No more configuration headaches.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to deploy with confidence
            </h2>
            <p className="text-xl text-slate-600">
              AI-powered analysis, smart recommendations, and seamless deployment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Smart Analysis
                </h3>
                <p className="text-slate-600 text-sm">
                  AI automatically detects your framework, dependencies, and potential deployment issues
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  One-Click Deploy
                </h3>
                <p className="text-slate-600 text-sm">
                  Deploy to Replit, VPS, or Docker with generated configuration files and commands
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  AI Assistant
                </h3>
                <p className="text-slate-600 text-sm">
                  Get instant help with deployment issues, configuration, and best practices
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-slate-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-slate-600 text-sm">
                  Your code is analyzed securely and deleted after deployment completion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify your deployments?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of developers who trust DeployBot for their deployment needs
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Deploying Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="text-blue-600 text-xl mr-2" />
            <span className="font-bold text-slate-900">DeployBot</span>
          </div>
          <p className="text-slate-600">
            © 2024 DeployBot. Making deployment simple for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
