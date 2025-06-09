import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import DeploymentModal from './deployment-modal';
import { MoreHorizontal, ExternalLink, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deployment {
  id: number;
  projectId: number;
  status: string;
  targetServer: string;
  deploymentUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  framework?: string;
  status: string;
}

interface DeploymentWithProject extends Deployment {
  project?: Project;
}

interface DeploymentTableProps {
  limit?: number;
}

export default function DeploymentTable({ limit }: DeploymentTableProps) {
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentWithProject | null>(null);
  const { toast } = useToast();

  // Fetch deployments
  const { data: deployments = [], isLoading, error } = useQuery<DeploymentWithProject[]>({
    queryKey: ['/api/deployments'],
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
    },
  });

  // Fetch projects to get project details
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Combine deployment data with project data
  const deploymentsWithProjects = deployments.map(deployment => ({
    ...deployment,
    project: projects.find(p => p.id === deployment.projectId)
  }));

  const displayedDeployments = limit 
    ? deploymentsWithProjects.slice(0, limit) 
    : deploymentsWithProjects;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'secondary' as const, text: 'Pending' },
      'building': { variant: 'secondary' as const, text: 'Building' },
      'deploying': { variant: 'secondary' as const, text: 'Deploying' },
      'deployed': { variant: 'default' as const, text: 'Live' },
      'failed': { variant: 'destructive' as const, text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant}>
        {config.text}
      </Badge>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ExternalLink className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No deployments yet</h3>
        <p className="text-slate-600 mb-4">Upload your first project to get started with deployments.</p>
        <Button onClick={() => window.location.href = '/upload'}>
          Upload Project
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Deployed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedDeployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {deployment.project?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {deployment.project?.name || `Project ${deployment.projectId}`}
                      </div>
                      <div className="text-sm text-slate-500">
                        {deployment.project?.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(deployment.status)}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {deployment.project?.framework || 'Unknown'}
                </TableCell>
                <TableCell className="text-sm text-slate-600 capitalize">
                  {deployment.targetServer}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {formatTimeAgo(deployment.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDeployment(deployment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {deployment.deploymentUrl && (
                          <DropdownMenuItem
                            onClick={() => window.open(deployment.deploymentUrl, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Site
                          </DropdownMenuItem>
                        )}
                        {deployment.status === 'failed' && (
                          <DropdownMenuItem>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retry Deploy
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDeployment && (
        <DeploymentModal
          deployment={selectedDeployment}
          isOpen={!!selectedDeployment}
          onClose={() => setSelectedDeployment(null)}
        />
      )}
    </>
  );
}
