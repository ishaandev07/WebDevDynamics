import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Deployment {
  id: number;
  projectId: number;
  status: string;
  targetServer: string;
  deploymentUrl?: string;
  errorMessage?: string;
  logs?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
    description?: string;
    framework?: string;
  };
}

interface DeploymentModalProps {
  deployment: Deployment;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeploymentModal({ deployment, isOpen, onClose }: DeploymentModalProps) {
  const { toast } = useToast();

  // Refetch deployment details periodically if it's in progress
  const { data: latestDeployment } = useQuery({
    queryKey: ['/api/deployments', deployment.id],
    enabled: isOpen && ['pending', 'building', 'deploying'].includes(deployment.status),
    refetchInterval: 2000, // Refetch every 2 seconds for active deployments
  });

  const currentDeployment = latestDeployment || deployment;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'building':
      case 'deploying':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'uploaded', label: 'Code uploaded and validated', completed: true },
      { key: 'building', label: 'Dependencies installed', completed: ['building', 'deploying', 'deployed', 'failed'].includes(status) },
      { key: 'deploying', label: 'Building application', completed: ['deploying', 'deployed', 'failed'].includes(status) },
      { key: 'deployed', label: 'Deploy to server', completed: status === 'deployed' },
    ];

    return steps;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "URL copied to clipboard",
    });
  };

  const formatLogs = (logs?: string) => {
    if (!logs) return ['$ Deployment started...'];
    return logs.split('\n').filter(line => line.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Deployment Details</DialogTitle>
          <DialogDescription>
            Monitor your deployment progress and view logs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Deployment Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">
                {currentDeployment.project?.name || `Project ${currentDeployment.projectId}`}
              </h4>
              <p className="text-sm text-slate-500">
                Target: {currentDeployment.targetServer} • Framework: {currentDeployment.project?.framework || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(currentDeployment.status)}
              <Badge 
                variant={
                  currentDeployment.status === 'deployed' ? 'default' :
                  currentDeployment.status === 'failed' ? 'destructive' :
                  'secondary'
                }
                className="capitalize"
              >
                {currentDeployment.status}
              </Badge>
            </div>
          </div>

          {/* Deployment URL */}
          {currentDeployment.deploymentUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-green-900">Deployment URL</h5>
                  <p className="text-sm text-green-700 font-mono">
                    {currentDeployment.deploymentUrl}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentDeployment.deploymentUrl!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(currentDeployment.deploymentUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {currentDeployment.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-medium text-red-900 mb-2">Error</h5>
              <p className="text-sm text-red-700">{currentDeployment.errorMessage}</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-slate-700 mb-3">Deployment Progress</h5>
            <div className="space-y-3">
              {getProgressSteps(currentDeployment.status).map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 ${
                    step.completed 
                      ? 'bg-green-500' 
                      : currentDeployment.status === 'failed' && index === getProgressSteps(currentDeployment.status).length - 1
                      ? 'bg-red-500'
                      : 'bg-slate-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : currentDeployment.status === 'building' && step.key === 'building' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : currentDeployment.status === 'deploying' && step.key === 'deploying' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    step.completed ? 'text-slate-700' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Logs */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h5 className="text-sm font-medium text-white mb-3">Deployment Logs</h5>
            <ScrollArea className="h-40">
              <div className="text-sm font-mono space-y-1">
                {formatLogs(currentDeployment.logs).map((line, index) => (
                  <div key={index} className={`${
                    line.includes('Error') || line.includes('Failed') 
                      ? 'text-red-400' 
                      : line.includes('Success') || line.includes('completed')
                      ? 'text-green-400'
                      : line.includes('Starting') || line.includes('Building')
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}>
                    {line}
                  </div>
                ))}
                {['building', 'deploying'].includes(currentDeployment.status) && (
                  <div className="text-yellow-400 animate-pulse">
                    $ Processing...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {currentDeployment.status === 'failed' && (
            <Button>
              Retry Deployment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
