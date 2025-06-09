import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/upload/file-upload";

export default function Upload() {
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
            <h1 className="text-2xl font-bold text-slate-900">Upload Project</h1>
            <p className="text-slate-600 mt-1">Upload your project files for analysis and deployment</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Project Upload</h2>
            <FileUpload />
            
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Supported Frameworks</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'React', 'Vue.js', 'Angular', 'Svelte',
                  'Node.js', 'Express', 'Fastify', 'Koa',
                  'Python', 'FastAPI', 'Django', 'Flask',
                  'Java', 'Spring Boot', 'PHP', 'Laravel'
                ].map((framework) => (
                  <div key={framework} className="bg-slate-50 rounded-lg p-3 text-center">
                    <span className="text-sm font-medium text-slate-700">{framework}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Tips for Better Analysis</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include package.json, requirements.txt, or equivalent dependency files</li>
                <li>• Add environment variable examples (.env.example)</li>
                <li>• Include README.md with setup instructions</li>
                <li>• Ensure your project has a clear entry point (main.js, app.py, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
