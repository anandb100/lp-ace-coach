import { useState } from "react";
import Hero from "@/components/Hero";
import DocumentUpload from "@/components/DocumentUpload";
import LeadershipPrinciples from "@/components/LeadershipPrinciples";
import InterviewQuestion from "@/components/InterviewQuestion";
import QuestionFeedback from "@/components/QuestionFeedback";
import FinalResults from "@/components/FinalResults";

type Step = "hero" | "upload" | "principles" | "questions" | "feedback" | "final";

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

// Mock analysis scores and feedback data
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

const generateMockSTARAnalysis = () => ({
  situation: {
    score: Math.floor(Math.random() * 15) + 80,
    feedback: "Clear context provided with good background details."
  },
  task: {
    score: Math.floor(Math.random() * 20) + 75,
    feedback: "Task was well-defined but could be more specific about scope."
  },
  action: {
    score: Math.floor(Math.random() * 25) + 70,
    feedback: "Actions described but need more detail on your specific contributions."
  },
  result: {
    score: Math.floor(Math.random() * 30) + 65,
    feedback: "Results mentioned but lack quantifiable metrics."
  }
});

const generateMockStrengths = () => [
  "Clear structure following STAR format",
  "Good demonstration of problem-solving skills",
  "Shows leadership and initiative"
];

const generateMockImprovements = () => [
  "Include specific metrics and numbers to quantify your impact",
  "Provide more details about the challenges you personally overcame",
  "Explain the long-term impact of your actions"
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPrinciples, setSelectedPrinciples] = useState<LeadershipPrinciple[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{audioBlob: Blob; transcript: string}>>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentScores, setCurrentScores] = useState(generateMockScores());
  const [currentSTARAnalysis, setCurrentSTARAnalysis] = useState(generateMockSTARAnalysis());
  const [currentStrengths, setCurrentStrengths] = useState(generateMockStrengths());
  const [currentImprovements, setCurrentImprovements] = useState(generateMockImprovements());
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [questionResults, setQuestionResults] = useState<Array<{questionNumber: number; principle: string; question: string; score: number; keyImprovements: string[]}>>([]);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);
  const [focusedPrinciple, setFocusedPrinciple] = useState<LeadershipPrinciple | null>(null);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const handleDocumentAnalysis = (result: any) => {
    setAnalysisResult(result);
    setAiQuestions(result.questions || []);
    navigateToStep("principles");
  };

  const handlePrinciplesSelected = (principles: LeadershipPrinciple[]) => {
    setSelectedPrinciples(principles);
  };

  const handleStartInterview = (focusPrinciple?: LeadershipPrinciple) => {
    if (focusPrinciple) {
      // Filter questions for the specific principle
      setFocusedPrinciple(focusPrinciple);
      const principleQuestions = mockQuestions.filter(q => q.principle === focusPrinciple.title).slice(0, 3);
      setAiQuestions(principleQuestions.length > 0 ? principleQuestions : mockQuestions.slice(0, 3));
    } else {
      // Use all questions (or AI-generated ones if available)
      setFocusedPrinciple(null);
      if (aiQuestions.length === 0) {
        setAiQuestions(mockQuestions);
      }
    }
    navigateToStep("questions");
  };

  const handleAnswerSubmitted = (answer: {audioBlob: Blob; transcript: string; analysisData?: any}) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCurrentTranscript(answer.transcript);
    
    // Use real AI feedback data if available, otherwise use mock data
    if (answer.analysisData) {
      setCurrentAnalysisData(answer.analysisData);
      setCurrentScores([]);
      setCurrentSTARAnalysis(answer.analysisData.starAnalysis);
      setCurrentStrengths([]);
      setCurrentImprovements([]);
      
      // Store question result for final summary
      const questionsToUse = aiQuestions.length > 0 ? aiQuestions : mockQuestions;
      const currentQuestion = questionsToUse[currentQuestionIndex];
      
      const questionResult = {
        questionNumber: currentQuestionIndex + 1,
        principle: currentQuestion.principle,
        question: currentQuestion.question,
        score: answer.analysisData.overallScore.score,
        keyImprovements: answer.analysisData.suggestedAnswer ? 
          [`Suggested approach: ${Object.values(answer.analysisData.suggestedAnswer).join(' ')}`] : []
      };
      
      setQuestionResults(prev => [...prev, questionResult]);
    } else {
      // Fallback to mock data
      const newScores = generateMockScores();
      const newSTARAnalysis = generateMockSTARAnalysis();
      const newStrengths = generateMockStrengths();
      const newImprovements = generateMockImprovements();
      
      setCurrentScores(newScores);
      setCurrentSTARAnalysis(newSTARAnalysis);
      setCurrentStrengths(newStrengths);
      setCurrentImprovements(newImprovements);
      
      const questionsToUse = aiQuestions.length > 0 ? aiQuestions : mockQuestions;
      const currentQuestion = questionsToUse[currentQuestionIndex];
      const overallScore = Math.round(newScores.reduce((sum, score) => sum + score.score, 0) / newScores.length);
      
      const questionResult = {
        questionNumber: currentQuestionIndex + 1,
        principle: currentQuestion.principle,
        question: currentQuestion.question,
        score: overallScore,
        keyImprovements: newImprovements
      };
      
      setQuestionResults(prev => [...prev, questionResult]);
    }
    
    setCurrentStep("feedback");
  };

  const handleFeedbackNext = () => {
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
          onNext={handleStartInterview}
        />
      )}
      
      {currentStep === "questions" && (
        <InterviewQuestion
          question={(aiQuestions.length > 0 ? aiQuestions : mockQuestions)[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={(aiQuestions.length > 0 ? aiQuestions : mockQuestions).length}
          onAnswerSubmitted={handleAnswerSubmitted}
          onNext={handleFeedbackNext}
        />
      )}
      
      {currentStep === "feedback" && (
        <QuestionFeedback
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={(aiQuestions.length > 0 ? aiQuestions : mockQuestions).length}
          transcript={currentTranscript}
          overallScore={currentAnalysisData?.overallScore || { score: calculateOverallScore(currentScores), feedback: "Mock feedback - needs improvement" }}
          starAnalysis={currentSTARAnalysis}
          suggestedAnswer={currentAnalysisData?.suggestedAnswer || {
            situation: "Example situation description with proper context...",
            task: "Example task with clear objectives...", 
            action: "Example actions taken with specific details...",
            result: "Example results with quantifiable metrics..."
          }}
          jobAlignment={currentAnalysisData?.jobAlignment || [
            "Mock alignment point 1 - demonstrates relevant skills",
            "Mock alignment point 2 - shows required experience", 
            "Mock alignment point 3 - matches job requirements"
          ]}
          onNext={handleFeedbackNext}
          isLastQuestion={currentQuestionIndex === (aiQuestions.length > 0 ? aiQuestions : mockQuestions).length - 1}
        />
      )}

      {currentStep === "final" && (
        <FinalResults
          overallScore={Math.round(questionResults.reduce((sum, result) => sum + result.score, 0) / questionResults.length)}
          questionResults={questionResults}
          onStartNew={() => {
            // Reset state for new session
            setCurrentStep("hero");
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setUploadedFiles([]);
            setSelectedPrinciples([]);
            setQuestionResults([]);
            setFocusedPrinciple(null);
            setAiQuestions([]);
          }}
        />
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
            <button onClick={() => navigateToStep("feedback")} className="px-2 py-1 text-xs bg-gray-100 rounded">Feedback</button>
            <button onClick={() => navigateToStep("final")} className="px-2 py-1 text-xs bg-gray-100 rounded">Final</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
