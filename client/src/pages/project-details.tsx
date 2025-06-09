import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Play, 
  Code, 
  Package, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ExternalLink,
  Download,
  Rocket,
  FileText,
  Terminal
} from "lucide-react";
import DeploymentLogs from "@/components/deployments/deployment-logs";
import DeploymentConfig from "@/components/deployments/deployment-config";

interface Project {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  status: string;
  framework?: string;
  buildCommand?: string;
  startCommand?: string;
  environmentVariables?: string;
  analysisResult?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ['/api/deployments'],
    select: (data: any[]) => data.filter(d => d.projectId === parseInt(id!)),
    enabled: !!id,
  });

  const latestDeployment = deployments[0];

  const createDeploymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/deployments', {
        projectId: parseInt(id!),
        targetServer: 'replit'
      });
      return response.json();
    },
    onSuccess: (deployment) => {
      toast({
        title: "Deployment Created",
        description: `Deployment #${deployment.id} has been created and is starting.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deployments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setLocation('/deployments');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to create deployment",
        variant: "destructive",
      });
    },
  });

  const reAnalyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/projects/${id}/analyze`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "Project re-analysis has been triggered.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Project Not Found</h2>
          <p className="text-slate-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-4 w-4" />;
      case 'analyzing':
        return <Settings className="h-4 w-4 animate-spin" />;
      case 'analyzed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'analyzing':
        return 'bg-yellow-100 text-yellow-800';
      case 'analyzed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const analysis = project.analysisResult 
    ? (typeof project.analysisResult === 'string' 
        ? JSON.parse(project.analysisResult) 
        : project.analysisResult)
    : null;

  const canDeploy = project.status === 'analyzed' && !analysis?.error;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="text-slate-600 mt-1">{project.description}</p>
            )}
          </div>
        </div>
        
        {/* Deploy Button */}
        {canDeploy && (
          <Button
            onClick={() => createDeploymentMutation.mutate()}
            disabled={createDeploymentMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {createDeploymentMutation.isPending ? (
              <>
                <Settings className="mr-2 h-5 w-5 animate-spin" />
                Creating Deployment...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-5 w-5" />
                Deploy Project
              </>
            )}
          </Button>
        )}
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Project Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1 capitalize">{project.status}</span>
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Framework</label>
              <p className="text-lg font-semibold text-slate-900">
                {project.framework || 'Detecting...'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">File Size</label>
              <p className="text-lg font-semibold text-slate-900">
                {(project.fileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Uploaded</label>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && !analysis.error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>
              Detected framework and deployment configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Framework Detection */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Framework Detection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-slate-600">Framework</label>
                  <p className="text-xl font-bold text-slate-900">{analysis.framework}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-slate-600">Confidence</label>
                  <p className="text-xl font-bold text-slate-900">
                    {(analysis.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-slate-600">Entry Point</label>
                  <p className="text-xl font-bold text-slate-900">{analysis.entryPoint}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Deployment Commands */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Deployment Commands</h3>
              <div className="space-y-3">
                {analysis.buildCommand && (
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg">
                    <label className="text-sm font-medium text-slate-400">Build Command</label>
                    <p className="font-mono text-sm">{analysis.buildCommand}</p>
                  </div>
                )}
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg">
                  <label className="text-sm font-medium text-slate-400">Start Command</label>
                  <p className="font-mono text-sm">{analysis.startCommand}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dependencies */}
            {analysis.dependencies && analysis.dependencies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Dependencies Found</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.dependencies.slice(0, 10).map((dep: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {dep}
                    </Badge>
                  ))}
                  {analysis.dependencies.length > 10 && (
                    <Badge variant="outline">
                      +{analysis.dependencies.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Issues & Recommendations */}
            {(analysis.issues?.length > 0 || analysis.recommendations?.length > 0) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.issues?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Issues Found
                      </h3>
                      <ul className="space-y-2">
                        {analysis.issues.map((issue: string, index: number) => (
                          <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {analysis?.error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              <span>Analysis Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{analysis.error}</p>
            <Button
              onClick={() => reAnalyzeMutation.mutate()}
              disabled={reAnalyzeMutation.isPending}
              variant="outline"
            >
              {reAnalyzeMutation.isPending ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Retry Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deployment Configuration */}
      {analysis && !analysis.error && (
        <DeploymentConfig projectId={parseInt(id!)} project={project} />
      )}

      {/* Current Deployment Status */}
      {latestDeployment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="h-5 w-5" />
              <span>Current Deployment</span>
            </CardTitle>
            <CardDescription>
              Latest deployment status and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getStatusColor(latestDeployment.status)}`}>
                    {getStatusIcon(latestDeployment.status)}
                    <span className="ml-1 capitalize">{latestDeployment.status}</span>
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-slate-600">Target Server</label>
                <p className="text-lg font-semibold text-slate-900 capitalize">
                  {latestDeployment.targetServer}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-slate-600">Created</label>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(latestDeployment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {latestDeployment.deploymentUrl && (
              <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Deployment URL:</span>
                <a 
                  href={latestDeployment.deploymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  {latestDeployment.deploymentUrl}
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployment Logs */}
      {latestDeployment && (
        <DeploymentLogs 
          deploymentId={latestDeployment.id} 
          deployment={latestDeployment}
        />
      )}

      {/* All Deployments History */}
      {deployments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span>Deployment History</span>
            </CardTitle>
            <CardDescription>
              Previous deployments for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.slice(1).map((deployment: any) => (
                <div
                  key={deployment.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(deployment.status)}`}>
                        {getStatusIcon(deployment.status)}
                        <span className="ml-1 capitalize">{deployment.status}</span>
                      </Badge>
                      <span className="text-sm text-slate-600">
                        Deployment #{deployment.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(deployment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {deployment.deploymentUrl && (
                      <a 
                        href={deployment.deploymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        View
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            {project.status === 'uploaded' && (
              <Button
                onClick={() => reAnalyzeMutation.mutate()}
                disabled={reAnalyzeMutation.isPending}
                variant="outline"
              >
                {reAnalyzeMutation.isPending ? (
                  <>
                    <Settings className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setLocation('/deployments')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View All Deployments
            </Button>
            
            <Button variant="outline" onClick={() => setLocation(`/projects/${id}/download`)}>
              <Download className="mr-2 h-4 w-4" />
              Download Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}