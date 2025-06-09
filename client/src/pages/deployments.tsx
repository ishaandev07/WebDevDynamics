import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeploymentTable from "@/components/deployments/deployment-table";
import { Link } from "wouter";

export default function Deployments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deployments</h1>
            <p className="text-slate-600 mt-1">Monitor and manage all your deployment activities</p>
          </div>
          <Link href="/upload">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <DeploymentTable />
        </div>
      </div>
    </>
  );
}
