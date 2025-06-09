import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Clock, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface Stats {
  totalProjects: number;
  successfulDeployments: number;
  failedDeployments: number;
  inProgressDeployments: number;
}

export default function StatsOverview() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-6 bg-slate-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Successful Deployments',
      value: stats?.successfulDeployments || 0,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Failed Deployments',
      value: stats?.failedDeployments || 0,
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressDeployments || 0,
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: Upload,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
