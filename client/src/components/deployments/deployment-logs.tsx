import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Terminal, 
  Download, 
  RefreshCw, 
  Play, 
  Square, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ExternalLink
} from "lucide-react";

interface DeploymentLogsProps {
  deploymentId: number;
  deployment?: {
    id: number;
    status: string;
    deploymentUrl?: string;
    errorMessage?: string;
    logs?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function DeploymentLogs({ deploymentId, deployment }: DeploymentLogsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: logs = '', refetch: refetchLogs } = useQuery({
    queryKey: [`/api/deployments/${deploymentId}/logs`],
    refetchInterval: autoRefresh && (deployment?.status === 'building' || deployment?.status === 'deploying') ? 2000 : false,
    enabled: !!deploymentId,
  });

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    // Stop auto-refresh when deployment is complete
    if (deployment?.status === 'deployed' || deployment?.status === 'failed') {
      setAutoRefresh(false);
    }
  }, [deployment?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'building':
      case 'deploying':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'building':
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      case 'deployed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const downloadLogs = () => {
    const logContent = (typeof logs === 'string' ? logs : '') || deployment?.logs || 'No logs available';
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-${deploymentId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayLogs = (typeof logs === 'string' ? logs : '') || deployment?.logs || 'No logs available';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <CardTitle>Deployment Logs</CardTitle>
            {deployment && (
              <Badge className={`${getStatusColor(deployment.status)} flex items-center space-x-1`}>
                {getStatusIcon(deployment.status)}
                <span className="capitalize">{deployment.status}</span>
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {(deployment?.status === 'building' || deployment?.status === 'deploying') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? (
                  <>
                    <Square className="mr-2 h-3 w-3" />
                    Pause Auto-refresh
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3 w-3" />
                    Resume Auto-refresh
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs}>
              <Download className="mr-2 h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
        
        {deployment?.deploymentUrl && deployment.status === 'deployed' && (
          <div className="flex items-center space-x-2 pt-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-slate-600">Deployment successful!</span>
            <a 
              href={deployment.deploymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View Live App
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}

        {deployment?.errorMessage && deployment.status === 'failed' && (
          <div className="flex items-center space-x-2 pt-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{deployment.errorMessage}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border bg-slate-950 p-4">
          <div className="font-mono text-sm">
            {displayLogs.split('\n').map((line: string, index: number) => (
              <div
                key={index}
                className={`py-1 ${
                  line.includes('✓') 
                    ? 'text-green-400' 
                    : line.includes('✗') || line.includes('Error') || line.includes('Failed')
                    ? 'text-red-400'
                    : line.includes('Warning')
                    ? 'text-yellow-400'
                    : 'text-slate-300'
                }`}
              >
                {line || '\u00A0'}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </ScrollArea>

        {(deployment?.status === 'building' || deployment?.status === 'deploying') && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-slate-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Deployment in progress... Auto-refreshing every 2 seconds</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}