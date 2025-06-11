import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, CheckCircle, AlertCircle, FileText, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadState {
  stage: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  fileName?: string;
  analysis?: any;
  projectId?: number;
}

export default function Upload() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [uploadState, setUploadState] = useState<UploadState>({ stage: 'idle', progress: 0 });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadState({ stage: 'uploading', progress: 0, fileName: file.name });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ""));
      formData.append('description', `Uploaded project: ${file.name}`);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 15, 85)
        }));
      }, 200);

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadState({ stage: 'analyzing', progress: 90, fileName: file.name, projectId: result.id });

      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch analysis results
      const analysisResponse = await fetch(`/api/projects/${result.id}/analysis`);
      const analysis = await analysisResponse.json();

      setUploadState({ 
        stage: 'complete', 
        progress: 100, 
        fileName: file.name, 
        analysis,
        projectId: result.id 
      });

    } catch (error) {
      setUploadState({ stage: 'error', progress: 0, fileName: file.name });
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
    setUploadState({ stage: 'idle', progress: 0 });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Lovable.dev inspired header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DeployBot
          </h1>
          <p className="text-slate-600 mt-1">AI-powered deployment optimization</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {uploadState.stage === 'idle' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UploadIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Upload your project
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Drop your project files and watch AI optimize them for deployment
              </p>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-slate-700 mb-2">
                  Drop your project files here
                </p>
                <p className="text-slate-500 mb-6">
                  or click to browse
                </p>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  Choose Files
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".zip,.tar,.gz,.tar.gz"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              Supported formats: ZIP, TAR, TAR.GZ (max 100MB)
            </div>
          </div>
        )}

        {(uploadState.stage === 'uploading' || uploadState.stage === 'analyzing') && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                {uploadState.stage === 'uploading' ? (
                  <UploadIcon className="w-8 h-8 text-white" />
                ) : (
                  <Zap className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {uploadState.stage === 'uploading' ? 'Uploading' : 'Analyzing'} {uploadState.fileName}
              </h3>
              <p className="text-slate-600">
                {uploadState.stage === 'uploading' 
                  ? 'Securely uploading your project files...' 
                  : 'AI is analyzing and optimizing your code...'}
              </p>
            </div>

            <div className="space-y-4">
              <Progress value={uploadState.progress} className="h-3" />
              <div className="flex justify-between text-sm text-slate-600">
                <span>{uploadState.stage === 'uploading' ? 'Uploading' : 'Analyzing'}...</span>
                <span>{Math.round(uploadState.progress)}%</span>
              </div>
            </div>

            {uploadState.stage === 'analyzing' && (
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Code className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Code Analysis</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900">Optimization</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Config Generation</p>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadState.stage === 'complete' && uploadState.analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Analysis Complete!
                </h3>
                <p className="text-slate-600">
                  Your project has been analyzed and optimized for deployment
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Project Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Framework:</span>
                      <span className="font-medium">{uploadState.analysis.framework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Entry Point:</span>
                      <span className="font-medium">{uploadState.analysis.entryPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dependencies:</span>
                      <span className="font-medium">{uploadState.analysis.dependencies?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Confidence:</span>
                      <span className="font-medium">{Math.round(uploadState.analysis.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Optimizations</h4>
                  <div className="space-y-2">
                    {uploadState.analysis.recommendations?.slice(0, 4).map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button 
                  onClick={() => window.open(`/deployed/${uploadState.projectId}`, '_blank')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  View Deployment
                </Button>
                <Button variant="outline" onClick={resetUpload}>
                  Upload Another
                </Button>
              </div>
            </div>
          </div>
        )}

        {uploadState.stage === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Failed</h3>
              <p className="text-slate-600 mb-6">
                There was an error processing your project. Please try again.
              </p>
              <Button onClick={resetUpload} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}