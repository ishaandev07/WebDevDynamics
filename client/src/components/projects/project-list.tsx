import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  ExternalLink,
  Rocket,
  FileText
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  status: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectList() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'analyzing':
        return <Settings className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'analyzed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-600" />;
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Recent Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Recent Projects</span>
          </CardTitle>
          <CardDescription>
            Upload your first project to get started with AI-powered deployment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 mb-4">No projects uploaded yet</p>
            <Link href="/upload">
              <Button>
                <Code className="mr-2 h-4 w-4" />
                Upload Your First Project
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="h-5 w-5" />
          <span>Recent Projects</span>
        </CardTitle>
        <CardDescription>
          Click on any project to view detailed analysis and deployment options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <Badge className={`${getStatusColor(project.status)} flex items-center space-x-1`}>
                      {getStatusIcon(project.status)}
                      <span className="capitalize">{project.status}</span>
                    </Badge>
                    {project.framework && (
                      <Badge variant="outline">
                        {project.framework}
                      </Badge>
                    )}
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-slate-600 mb-2">{project.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{project.fileName}</span>
                    <span>{(project.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {project.status === 'analyzed' && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This would trigger deployment creation
                        window.location.href = `/projects/${project.id}`;
                      }}
                    >
                      <Rocket className="mr-1 h-3 w-3" />
                      Deploy
                    </Button>
                  )}
                  
                  <Link href={`/projects/${project.id}`}>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {projects.length >= 5 && (
            <div className="text-center pt-4">
              <Link href="/projects">
                <Button variant="outline">
                  View All Projects
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}