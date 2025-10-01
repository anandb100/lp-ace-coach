import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  name: string;
  type: "resume" | "jobDescription";
  size: number;
  file: File;
}

interface DocumentUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onNext: (analysisResult: any) => void;
}

const DocumentUpload = ({ onFilesUploaded, onNext }: DocumentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      type: uploadedFiles.length === 0 ? "resume" : "jobDescription",
      size: file.size,
      file: file,
    }));

    if (uploadedFiles.length + newFiles.length > 2) {
      toast({
        title: "File limit exceeded",
        description: "You can only upload 2 files: resume and job description",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);
      
      toast({
        title: "Files uploaded successfully",
        description: `${newFiles.length} file(s) processed`,
      });
    }, 1000);
  }, [uploadedFiles, onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 2 - uploadedFiles.length,
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  const canProceed = uploadedFiles.length >= 2;

  const handleAnalyzeDocuments = async () => {
    if (uploadedFiles.length < 2) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Use constant dummy user ID for all sessions
      const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

      // Read file contents
      const resumeFile = uploadedFiles.find(f => f.type === "resume");
      const jobDescFile = uploadedFiles.find(f => f.type === "jobDescription");
      
      if (!resumeFile || !jobDescFile) {
        throw new Error("Both resume and job description are required");
      }

      const resumeContent = await resumeFile.file.text();
      const jobDescriptionContent = await jobDescFile.file.text();

      // Store documents in database with dummy user ID
      const { error: resumeError } = await supabase
        .from('documents')
        .insert({
          user_id: DUMMY_USER_ID,
          type: 'resume',
          content: resumeContent,
          filename: resumeFile.name,
        });

      if (resumeError) {
        console.error('Error storing resume:', resumeError);
        toast({
          title: "Error",
          description: "Failed to store resume.",
          variant: "destructive",
        });
        return;
      }

      const { error: jdError } = await supabase
        .from('documents')
        .insert({
          user_id: DUMMY_USER_ID,
          type: 'job_description',
          content: jobDescriptionContent,
          filename: jobDescFile.name,
        });

      if (jdError) {
        console.error('Error storing job description:', jdError);
        toast({
          title: "Error",
          description: "Failed to store job description.",
          variant: "destructive",
        });
        return;
      }

      // Call the analyze-documents function
      const { data, error } = await supabase.functions.invoke('analyze-documents', {
        body: {
          resumeContent,
          jobDescriptionContent
        }
      });

      if (error) {
        console.error('Supabase function error details:', error);
        throw error;
      }
      
      toast({
        title: "Analysis Complete",
        description: "Documents analyzed successfully with AI",
      });

      onNext(data);
      
    } catch (error) {
      console.error('Error analyzing documents:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Upload Your Documents</h2>
          <p className="text-muted-foreground">
            Upload your resume and the job description to get started with personalized interview questions
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload your resume and job description (PDF, DOC, DOCX, or TXT files)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            {uploadedFiles.length < 2 && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                    </p>
                    <p className="text-muted-foreground">
                      or click to browse ({2 - uploadedFiles.length} files remaining)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Uploaded Files</h3>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.type === "resume" ? "Resume" : "Job Description"} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next Button */}
            {canProceed && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleAnalyzeDocuments}
                  size="lg"
                  className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing with AI..." : "Analyze Documents & Continue"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;