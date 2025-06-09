import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { CloudUpload, FileText, X, Folder, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState<'zip' | 'folder' | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Project "${data.name}" uploaded and analysis started.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      resetForm();
      onUploadSuccess?.();
    },
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
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload project",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedFiles(null);
    setUploadType(null);
    setProjectName('');
    setProjectDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      
      // Check if it's a single zip file
      if (files.length === 1 && files[0].name.endsWith('.zip')) {
        setSelectedFiles(files);
        setUploadType('zip');
        if (!projectName) {
          setProjectName(files[0].name.replace('.zip', ''));
        }
      } else {
        // Multiple files or folder upload
        setSelectedFiles(files);
        setUploadType('folder');
        if (!projectName) {
          setProjectName('Project-' + Date.now());
        }
      }
    }
  }, [projectName, toast]);

  const handleZipFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFiles(e.target.files);
        setUploadType('zip');
        if (!projectName) {
          setProjectName(file.name.replace('.zip', ''));
        }
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .zip file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      setUploadType('folder');
      if (!projectName) {
        // Extract folder name from first file path
        const firstFile = e.target.files[0];
        const pathParts = firstFile.webkitRelativePath?.split('/') || [];
        const folderName = pathParts[0] || 'Project-' + Date.now();
        setProjectName(folderName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files or a folder to upload",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    
    if (uploadType === 'zip') {
      formData.append('file', selectedFiles[0]);
    } else {
      // For folder uploads, append all files with their relative paths
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
        formData.append('paths', file.webkitRelativePath || file.name);
      });
    }
    
    formData.append('name', projectName.trim());
    formData.append('description', projectDescription.trim());
    formData.append('uploadType', uploadType || 'folder');

    uploadMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div className="space-y-4">
        {/* Upload Type Selection */}
        <div className="flex gap-4 justify-center">
          <Button
            type="button"
            variant={uploadType === 'folder' ? 'default' : 'outline'}
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <Folder className="h-4 w-4" />
            <span>Upload Folder</span>
          </Button>
          <Button
            type="button"
            variant={uploadType === 'zip' ? 'default' : 'outline'}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>Upload ZIP</span>
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            dragActive 
              ? "border-blue-600 bg-blue-50" 
              : selectedFiles && selectedFiles.length > 0
              ? "border-green-300 bg-green-50"
              : "border-slate-300 hover:border-blue-600 hover:bg-blue-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleZipFileSelect}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            {...({ webkitdirectory: '', directory: '' } as any)}
            onChange={handleFolderSelect}
            className="hidden"
          />

          {selectedFiles && selectedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadType === 'zip' ? (
                <Archive className="mx-auto h-12 w-12 text-green-600" />
              ) : (
                <Folder className="mx-auto h-12 w-12 text-green-600" />
              )}
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg font-medium text-green-900">
                  {uploadType === 'zip' 
                    ? selectedFiles[0].name 
                    : `${selectedFiles.length} files selected`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-green-800">
                {uploadType === 'zip' 
                  ? `${(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB`
                  : `Total: ${(Array.from(selectedFiles).reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <CloudUpload className="mx-auto h-12 w-12 text-slate-600" />
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Drop your project here
                </h3>
                <p className="text-slate-600 mb-4">
                  Drag & drop a folder or ZIP file, or click buttons above to browse
                </p>
                <p className="text-sm text-slate-500">
                  Supports project folders and ZIP files up to 100MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name *</Label>
          <Input
            id="project-name"
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="project-description">Description (Optional)</Label>
          <Textarea
            id="project-description"
            placeholder="Brief description of your project"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!selectedFiles || selectedFiles.length === 0 || !projectName.trim() || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          'Upload Project'
        )}
      </Button>
    </form>
  );
}
