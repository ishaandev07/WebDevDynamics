import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Database, Upload, Package, TrendingUp, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Dataset {
  id: string | number;
  name: string;
  description: string;
  record_count: number;
  uploaded_at: string;
  is_active: boolean;
}

interface FeedbackStats {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_rate: number;
}

export default function Marketplace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch datasets
  const { data: datasetsData, isLoading: datasetsLoading } = useQuery({
    queryKey: ["/api/ai/datasets"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/datasets");
      if (!response.ok) throw new Error("Failed to fetch datasets");
      return response.json();
    },
  });

  // Fetch feedback stats
  const { data: feedbackStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/ai/feedback/stats"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/feedback/stats");
      if (!response.ok) throw new Error("Failed to fetch feedback stats");
      return response.json();
    },
  });

  // Upload dataset mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("http://localhost:8000/datasets/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload dataset");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dataset uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/datasets"] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDatasetName("");
      setDatasetDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json" || file.name.endsWith(".jsonl")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON or JSONL file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !datasetName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a dataset name",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", datasetName.trim());
    formData.append("description", datasetDescription.trim());

    uploadMutation.mutate(formData);
  };

  const datasets = datasetsData?.datasets || [];
  const stats: FeedbackStats = feedbackStats || { total_feedback: 0, positive_feedback: 0, negative_feedback: 0, positive_rate: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Marketplace</h1>
          <p className="text-muted-foreground">
            Manage datasets, monitor AI performance, and enhance your chatbot capabilities
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Dataset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input
                  id="dataset-name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                />
              </div>
              <div>
                <Label htmlFor="dataset-description">Description (Optional)</Label>
                <Textarea
                  id="dataset-description"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  placeholder="Describe your dataset"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="dataset-file">File (JSON/JSONL)</Label>
                <Input
                  id="dataset-file"
                  type="file"
                  accept=".json,.jsonl"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{datasets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Including built-in datasets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {datasets.reduce((sum: number, dataset: Dataset) => sum + dataset.record_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Training data points
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.positive_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  Based on user feedback
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_feedback}</div>
                <p className="text-xs text-muted-foreground">
                  User interactions logged
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Performance Summary</CardTitle>
              <CardDescription>
                Current state of your AI assistant and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={stats.positive_rate >= 80 ? "default" : "secondary"}>
                    {stats.positive_rate >= 80 ? "Excellent" : stats.positive_rate >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                  <span className="text-sm">AI Response Quality</span>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-1">Performance Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        {stats.positive_rate >= 80 
                          ? "Your AI assistant is performing excellently with high user satisfaction." 
                          : stats.positive_rate >= 60 
                          ? "Your AI assistant is performing well. Consider adding more training data for improvement."
                          : "Consider uploading additional datasets to improve AI responses and user satisfaction."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {datasetsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading datasets...</div>
                </CardContent>
              </Card>
            ) : (
              datasets.map((dataset: Dataset) => (
                <Card key={dataset.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {dataset.description}
                        </CardDescription>
                      </div>
                      <Badge variant={dataset.is_active ? "default" : "secondary"}>
                        {dataset.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Records:</span>
                        <span className="font-medium">{dataset.record_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Added:</span>
                        <span className="font-medium">{dataset.uploaded_at}</span>
                      </div>
                      {typeof dataset.id === "string" && (dataset.id === "internal" || dataset.id === "external") && (
                        <div className="pt-2">
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Built-in
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Analytics</CardTitle>
              <CardDescription>
                Detailed breakdown of user feedback and AI performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-8">Loading analytics...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.positive_feedback}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Positive Feedback</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.negative_feedback}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">Negative Feedback</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.positive_rate}%
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Success Rate</div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Monitor feedback regularly to identify improvement areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Upload domain-specific datasets to improve response accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Review negative feedback to understand common issues</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}