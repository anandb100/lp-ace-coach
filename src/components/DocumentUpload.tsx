import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, CheckCircle, X, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadProps {
  onFilesUploaded: (files: any[]) => void;
  onNext: (analysisResult: any) => void;
}

interface FileUploadCardProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

const FileUploadCard = ({ title, description, file, onFileSelect, onFileRemove }: FileUploadCardProps) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {isDragActive ? "Drop file here..." : "Drop file or click"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC, DOCX, or TXT
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border-2 border-success/30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DocumentUpload = ({ onFilesUploaded, onNext }: DocumentUploadProps) => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleResumeSelect = (file: File) => {
    setResume(file);
    toast({
      title: "Resume uploaded",
      description: file.name,
    });
  };

  const handleJobDescriptionSelect = (file: File) => {
    setJobDescription(file);
    toast({
      title: "Job description uploaded",
      description: file.name,
    });
  };

  const handleResumeRemove = () => {
    setResume(null);
  };

  const handleJobDescriptionRemove = () => {
    setJobDescription(null);
  };

  const canProceed = resume !== null && jobDescription !== null;

  const handleAnalyzeDocuments = async () => {
    if (!resume || !jobDescription) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Use constant dummy user ID for all sessions
      const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

      // Read file contents as text
      let resumeContent = await resume.text();
      let jobDescriptionContent = await jobDescription.text();

      // Clean content to remove problematic characters for PostgreSQL
      resumeContent = resumeContent
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
        .replace(/\\/g, '\\\\'); // Escape backslashes
      
      jobDescriptionContent = jobDescriptionContent
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove other control characters
        .replace(/\\/g, '\\\\'); // Escape backslashes

      // Store documents in database with dummy user ID
      const { error: resumeError } = await supabase
        .from('documents')
        .insert({
          user_id: DUMMY_USER_ID,
          type: 'resume',
          content: resumeContent,
          filename: resume.name,
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
          filename: jobDescription.name,
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

      // Notify parent about files (for compatibility)
      onFilesUploaded([
        { id: '1', name: resume.name, type: 'resume', size: resume.size, file: resume },
        { id: '2', name: jobDescription.name, type: 'jobDescription', size: jobDescription.size, file: jobDescription }
      ]);

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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Upload Your Documents</h2>
          <p className="text-muted-foreground">
            Upload your resume and the job description to get started with personalized interview questions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <FileUploadCard
            title="Resume"
            description="Upload your resume or CV"
            file={resume}
            onFileSelect={handleResumeSelect}
            onFileRemove={handleResumeRemove}
          />
          
          <FileUploadCard
            title="Job Description"
            description="Upload the job description"
            file={jobDescription}
            onFileSelect={handleJobDescriptionSelect}
            onFileRemove={handleJobDescriptionRemove}
          />
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyzeDocuments}
            size="lg"
            className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
            disabled={!canProceed || isAnalyzing}
          >
            {isAnalyzing ? "Analyzing with AI..." : "Analyze Documents & Continue"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
