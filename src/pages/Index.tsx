import { useState } from "react";
import Hero from "@/components/Hero";
import DocumentUpload from "@/components/DocumentUpload";
import LeadershipPrinciples from "@/components/LeadershipPrinciples";
import InterviewQuestion from "@/components/InterviewQuestion";
import AnalysisResults from "@/components/AnalysisResults";

type Step = "hero" | "upload" | "principles" | "questions" | "analysis" | "final";

interface UploadedFile {
  id: string;
  name: string;
  type: "resume" | "jobDescription";
  size: number;
  file: File;
}

interface LeadershipPrinciple {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  keyBehaviors: string[];
}

// Mock questions data
const mockQuestions = [
  {
    id: "q1",
    principle: "Customer Obsession",
    question: "Tell me about a time when you had to make a decision between what was best for the customer and what was easier for your company or team.",
    context: "Focus on a situation where customer needs conflicted with internal processes or constraints.",
    starFramework: {
      situation: "Describe the context and customer need",
      task: "What was your responsibility?", 
      action: "What steps did you take?",
      result: "What was the customer impact?"
    }
  },
  {
    id: "q2", 
    principle: "Ownership",
    question: "Describe a time when you took on something outside your area of responsibility because it was the right thing to do.",
    context: "Think about cross-functional challenges or gaps you identified and addressed.",
    starFramework: {
      situation: "Set the scene for the problem",
      task: "Why did you feel ownership?",
      action: "How did you take initiative?", 
      result: "What was the long-term impact?"
    }
  },
  {
    id: "q3",
    principle: "Invent and Simplify", 
    question: "Tell me about a time when you invented a solution or simplified a complex process.",
    context: "Focus on innovation that created measurable business value.",
    starFramework: {
      situation: "What was the complex challenge?",
      task: "What innovation was needed?",
      action: "How did you develop the solution?",
      result: "What efficiency gains resulted?"
    }
  },
  {
    id: "q4",
    principle: "Bias for Action",
    question: "Describe a situation where you had to make an important decision without having all the information you wanted.",
    context: "Highlight calculated risk-taking and decision-making under uncertainty.",
    starFramework: {
      situation: "What decision was needed?",
      task: "What information was missing?",
      action: "How did you proceed anyway?", 
      result: "What was the outcome?"
    }
  },
  {
    id: "q5",
    principle: "Hire and Develop the Best",
    question: "Tell me about a time when you helped develop someone on your team who was struggling.",
    context: "Focus on talent development and raising performance standards.",
    starFramework: {
      situation: "Who needed development?",
      task: "What was your role as developer?",
      action: "What development approach did you take?",
      result: "How did they improve?"
    }
  }
];

// Mock analysis scores
const generateMockScores = () => [
  {
    category: "STAR Structure",
    score: Math.floor(Math.random() * 30) + 65,
    feedback: "Good use of STAR framework with clear situation and task definition.",
    improvement: "Add more specific metrics and quantify the results achieved."
  },
  {
    category: "Leadership Demonstration", 
    score: Math.floor(Math.random() * 25) + 70,
    feedback: "Demonstrated leadership qualities effectively.",
    improvement: "Include more details about how you influenced and guided others."
  },
  {
    category: "Customer Focus",
    score: Math.floor(Math.random() * 20) + 75, 
    feedback: "Showed good customer-centric thinking.",
    improvement: "Elaborate on the customer impact and long-term relationship building."
  },
  {
    category: "Measurable Impact",
    score: Math.floor(Math.random() * 35) + 55,
    feedback: "Some quantifiable results mentioned.",
    improvement: "Include more specific numbers, percentages, and timeframes to strengthen your story."
  }
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPrinciples, setSelectedPrinciples] = useState<LeadershipPrinciple[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{audioBlob: Blob; transcript: string}>>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentScores, setCurrentScores] = useState(generateMockScores());
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleDocumentAnalysis = (result: any) => {
    setAnalysisResult(result);
    setAiQuestions(result.questions || mockQuestions);
    navigateToStep("principles");
  };

  const handlePrinciplesSelected = (principles: LeadershipPrinciple[]) => {
    setSelectedPrinciples(principles);
  };

  const handleAnswerSubmitted = (answer: {audioBlob: Blob; transcript: string}) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentTranscript(answer.transcript);
    setCurrentScores(generateMockScores());
    setCurrentStep("analysis");
  };

  const handleAnalysisNext = () => {
    const questionsToUse = aiQuestions.length > 0 ? aiQuestions : mockQuestions;
    if (currentQuestionIndex < questionsToUse.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentStep("questions");
    } else {
      setCurrentStep("final");
    }
  };

  const navigateToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const calculateOverallScore = (scores: any[]) => {
    return Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
  };

  return (
    <div>
      {currentStep === "hero" && (
        <Hero onGetStarted={() => navigateToStep("upload")} />
      )}
      
      {currentStep === "upload" && (
        <DocumentUpload 
          onFilesUploaded={handleFilesUploaded}
          onNext={handleDocumentAnalysis}
        />
      )}
      
      {currentStep === "principles" && (
        <LeadershipPrinciples
          analysisResult={analysisResult}
          onPrinciplesSelected={handlePrinciplesSelected}
          onNext={() => navigateToStep("questions")}
        />
      )}
      
      {currentStep === "questions" && (
        <InterviewQuestion
          question={(aiQuestions.length > 0 ? aiQuestions : mockQuestions)[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={(aiQuestions.length > 0 ? aiQuestions : mockQuestions).length}
          onAnswerSubmitted={handleAnswerSubmitted}
          onNext={handleAnalysisNext}
        />
      )}
      
      {currentStep === "analysis" && (
        <AnalysisResults
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={(aiQuestions.length > 0 ? aiQuestions : mockQuestions).length}
          transcript={currentTranscript}
          scores={currentScores}
          overallScore={calculateOverallScore(currentScores)}
          onNext={handleAnalysisNext}
          isLastQuestion={currentQuestionIndex === (aiQuestions.length > 0 ? aiQuestions : mockQuestions).length - 1}
        />
      )}

      {currentStep === "final" && (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Interview Complete! 🎉</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You've successfully completed all 5 questions. Review your performance and start preparing for your Amazon interview!
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  // Reset state for new session
                  setCurrentStep("hero");
                  setCurrentQuestionIndex(0);
                  setAnswers([]);
                  setUploadedFiles([]);
                  setSelectedPrinciples([]);
                }}
                className="bg-gradient-primary text-white px-8 py-3 rounded-lg hover:shadow-elegant transition-all duration-300"
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Helper (hidden in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <div className="text-xs font-medium mb-2">Dev Navigation:</div>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => navigateToStep("hero")} className="px-2 py-1 text-xs bg-gray-100 rounded">Hero</button>
            <button onClick={() => navigateToStep("upload")} className="px-2 py-1 text-xs bg-gray-100 rounded">Upload</button>
            <button onClick={() => navigateToStep("principles")} className="px-2 py-1 text-xs bg-gray-100 rounded">Principles</button>
            <button onClick={() => navigateToStep("questions")} className="px-2 py-1 text-xs bg-gray-100 rounded">Questions</button>
            <button onClick={() => navigateToStep("analysis")} className="px-2 py-1 text-xs bg-gray-100 rounded">Analysis</button>
            <button onClick={() => navigateToStep("final")} className="px-2 py-1 text-xs bg-gray-100 rounded">Final</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
