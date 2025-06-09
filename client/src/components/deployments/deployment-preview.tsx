import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Globe, 
  Shield, 
  Zap,
  Monitor,
  Check,
  AlertCircle
} from "lucide-react";

interface DeploymentPreviewProps {
  deployment: {
    id: number;
    status: string;
    deploymentUrl?: string;
    project?: {
      name: string;
      framework?: string;
    };
  };
}

export default function DeploymentPreview({ deployment }: DeploymentPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const isSuccess = deployment.status === 'success';
  const projectName = deployment.project?.name || 'Application';
  const framework = deployment.project?.framework || 'Web Application';

  const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Live Application</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { 
            text-align: center; max-width: 800px; background: rgba(255,255,255,0.1);
            padding: 60px; border-radius: 20px; backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        h1 { font-size: 3rem; margin-bottom: 20px; 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .status { background: #28a745; color: white; padding: 12px 24px; 
            border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: bold;
        }
        .info { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; 
            margin: 30px 0; text-align: left;
        }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px; margin: 30px 0;
        }
        .feature { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
        .btn { background: linear-gradient(45deg, #667eea, #764ba2); color: white;
            padding: 12px 24px; border: none; border-radius: 25px; margin: 10px;
            text-decoration: none; display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${projectName}</h1>
        <div class="status">Successfully Deployed</div>
        <div class="info">
            <h3>Deployment Information</h3>
            <p><strong>Framework:</strong> ${framework}</p>
            <p><strong>Status:</strong> Live and Running</p>
            <p><strong>Deployed:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="features">
            <div class="feature"><h4>High Performance</h4><p>Optimized build</p></div>
            <div class="feature"><h4>Secure</h4><p>HTTPS enabled</p></div>
            <div class="feature"><h4>Responsive</h4><p>Mobile-friendly</p></div>
            <div class="feature"><h4>Monitored</h4><p>Health checks active</p></div>
        </div>
        <p>Deployed via Smart Deployment Dashboard</p>
    </div>
</body>
</html>`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Application Preview</CardTitle>
            <Badge variant={isSuccess ? "default" : "secondary"}>
              {isSuccess ? "Live" : "Offline"}
            </Badge>
          </div>
          {isSuccess && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Monitor className="mr-2 h-4 w-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          )}
        </div>
        <CardDescription>
          {isSuccess 
            ? "Your application is deployed and accessible"
            : "Application deployment in progress"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-800">Status</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Zap className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Performance</div>
                  <div className="text-xs text-blue-600">Optimized</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-purple-800">Security</div>
                  <div className="text-xs text-purple-600">HTTPS</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <Monitor className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-orange-800">Monitoring</div>
                  <div className="text-xs text-orange-600">Active</div>
                </div>
              </div>
            </div>

            {showPreview && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-slate-600 ml-4">
                      {projectName.toLowerCase().replace(/\s+/g, '-')}.replit.app
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </div>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-96 border-0"
                  title="Application Preview"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-900">Application URL</div>
                <div className="text-sm text-slate-600">
                  Your deployed application is live and accessible
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Monitor className="h-4 w-4" />
                  <span>{showPreview ? "Hide" : "Show"} Preview</span>
                </Button>
                <Button
                  onClick={() => window.open(`/deployed/${deployment.id}`, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open App</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">Deployment in Progress</div>
              <div className="text-sm text-yellow-600">
                Your application will be available once deployment completes
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}