import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Database, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DatasetRecord {
  input: string;
  output: string;
}

interface UploadStatus {
  uploading: boolean;
  progress: number;
  success: boolean;
  error: string | null;
  recordsAdded: number;
}

export default function DatasetUpload() {
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    progress: 0,
    success: false,
    error: null,
    recordsAdded: 0
  });
  const [previewData, setPreviewData] = useState<DatasetRecord[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      previewFile(file);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.jsonl')) {
        data = text.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      }
      
      const preview = data.slice(0, 3).map(item => {
        if (item.input && item.output) {
          return { input: item.input, output: item.output };
        } else if (item.question && item.answer) {
          return { input: item.question, output: item.answer };
        } else if (item.prompt && item.response) {
          return { input: item.prompt, output: item.response };
        }
        return null;
      }).filter(Boolean) as DatasetRecord[];
      
      setPreviewData(preview);
    } catch (error) {
      toast({
        title: "File Preview Error",
        description: "Unable to preview the selected file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const parseManualData = () => {
    try {
      const data = JSON.parse(manualData);
      if (Array.isArray(data)) {
        const preview = data.slice(0, 3).map(item => {
          if (item.input && item.output) {
            return { input: item.input, output: item.output };
          }
          return null;
        }).filter(Boolean) as DatasetRecord[];
        
        setPreviewData(preview);
        return data;
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON format. It should be an array of objects with 'input' and 'output' fields.",
        variant: "destructive"
      });
      return null;
    }
  };

  const uploadDataset = async () => {
    if (!datasetName.trim()) {
      toast({
        title: "Dataset Name Required",
        description: "Please provide a name for your dataset.",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus({
      uploading: true,
      progress: 0,
      success: false,
      error: null,
      recordsAdded: 0
    });

    try {
      const formData = new FormData();
      formData.append('name', datasetName);
      formData.append('description', datasetDescription);

      if (selectedFile) {
        formData.append('file', selectedFile);
        setUploadStatus(prev => ({ ...prev, progress: 30 }));
      } else if (manualData.trim()) {
        const blob = new Blob([manualData], { type: 'application/json' });
        const file = new File([blob], `${datasetName}.json`, { type: 'application/json' });
        formData.append('file', file);
        setUploadStatus(prev => ({ ...prev, progress: 30 }));
      } else {
        throw new Error("Please select a file or provide manual data");
      }

      setUploadStatus(prev => ({ ...prev, progress: 60 }));

      const response = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData
      });

      setUploadStatus(prev => ({ ...prev, progress: 90 }));

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setUploadStatus({
        uploading: false,
        progress: 100,
        success: true,
        error: null,
        recordsAdded: result.recordsAdded || 0
      });

      toast({
        title: "Dataset Uploaded Successfully",
        description: `Added ${result.recordsAdded} records to the knowledge base.`
      });

      // Reset form
      setDatasetName("");
      setDatasetDescription("");
      setSelectedFile(null);
      setManualData("");
      setPreviewData([]);

    } catch (error) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
        recordsAdded: 0
      });

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Dataset Upload</h1>
            <p className="text-muted-foreground">Upload custom datasets to enhance the AI knowledge base</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Dataset
              </CardTitle>
              <CardDescription>
                Upload JSON or JSONL files containing question-answer pairs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input
                  id="dataset-name"
                  placeholder="Enter dataset name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataset-description">Description (Optional)</Label>
                <Textarea
                  id="dataset-description"
                  placeholder="Describe the purpose and content of this dataset"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json,.jsonl"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: JSON, JSONL (max 10MB)
                </p>
              </div>

              <div className="text-center text-muted-foreground">
                OR
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-data">Manual JSON Input</Label>
                <Textarea
                  id="manual-data"
                  placeholder='[{"input": "What is your return policy?", "output": "Our return policy allows..."}]'
                  value={manualData}
                  onChange={(e) => setManualData(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={parseManualData}
                  disabled={!manualData.trim()}
                >
                  Preview Manual Data
                </Button>
              </div>

              {uploadStatus.uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadStatus.progress}%</span>
                  </div>
                  <Progress value={uploadStatus.progress} />
                </div>
              )}

              {uploadStatus.success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Successfully added {uploadStatus.recordsAdded} records
                  </span>
                </div>
              )}

              {uploadStatus.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {uploadStatus.error}
                  </span>
                </div>
              )}

              <Button
                onClick={uploadDataset}
                disabled={uploadStatus.uploading || (!selectedFile && !manualData.trim()) || !datasetName.trim()}
                className="w-full"
              >
                {uploadStatus.uploading ? "Uploading..." : "Upload Dataset"}
              </Button>
            </CardContent>
          </Card>

          {/* Preview and Guidelines */}
          <div className="space-y-6">
            {/* Data Preview */}
            {previewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Data Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of the first few records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previewData.map((record, index) => (
                      <div key={index} className="p-3 border rounded-md space-y-2">
                        <div>
                          <strong className="text-sm">Input:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.input.length > 100 
                              ? `${record.input.substring(0, 100)}...` 
                              : record.input}
                          </p>
                        </div>
                        <div>
                          <strong className="text-sm">Output:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.output.length > 100 
                              ? `${record.output.substring(0, 100)}...` 
                              : record.output}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Format Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Format Guidelines</CardTitle>
                <CardDescription>
                  Follow these guidelines for best results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">JSON Format:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`[
  {
    "input": "Question or query",
    "output": "Answer or response"
  },
  {
    "input": "Another question",
    "output": "Another response"
  }
]`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">JSONL Format:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
{`{"input": "Question 1", "output": "Answer 1"}
{"input": "Question 2", "output": "Answer 2"}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alternative Field Names:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code>question</code> / <code>answer</code></li>
                    <li>• <code>prompt</code> / <code>response</code></li>
                    <li>• <code>input</code> / <code>output</code></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use clear, specific questions</li>
                    <li>• Provide complete, helpful answers</li>
                    <li>• Include common variations of questions</li>
                    <li>• Keep responses concise but informative</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}