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

// Mock questions data - 3 questions per principle
const mockQuestions = [
  // Customer Obsession
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
    principle: "Customer Obsession",
    question: "Describe a time when you went above and beyond to help a customer succeed.",
    context: "Focus on exceeding expectations and building long-term customer relationships.",
    starFramework: {
      situation: "What was the customer challenge?",
      task: "What was expected vs what you did?",
      action: "How did you exceed expectations?",
      result: "What was the customer feedback?"
    }
  },
  {
    id: "q3",
    principle: "Customer Obsession",
    question: "Tell me about a time when you had to say no to a customer request. How did you handle it?",
    context: "Focus on balancing customer needs with business constraints.",
    starFramework: {
      situation: "What was the customer asking for?",
      task: "Why couldn't you fulfill the request?",
      action: "How did you communicate and offer alternatives?",
      result: "How did the customer respond?"
    }
  },
  
  // Ownership
  {
    id: "q4", 
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
    id: "q5",
    principle: "Ownership",
    question: "Tell me about a time when you had to take ownership of a mistake or failure.",
    context: "Focus on accountability and how you turned a negative situation into a learning opportunity.",
    starFramework: {
      situation: "What went wrong?",
      task: "What was your responsibility?",
      action: "How did you take ownership and fix it?",
      result: "What did you learn?"
    }
  },
  {
    id: "q6",
    principle: "Ownership",
    question: "Describe a time when you saw a problem that wasn't being addressed and took action.",
    context: "Think about proactive problem-solving and driving results without being asked.",
    starFramework: {
      situation: "What problem did you identify?",
      task: "Why wasn't it being addressed?",
      action: "What initiative did you take?",
      result: "What changed as a result?"
    }
  },
  
  // Invent and Simplify
  {
    id: "q7",
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
    id: "q8",
    principle: "Invent and Simplify",
    question: "Describe a time when you challenged the status quo and proposed a simpler approach.",
    context: "Focus on eliminating unnecessary complexity and improving efficiency.",
    starFramework: {
      situation: "What was the existing process?",
      task: "What complications did you identify?",
      action: "How did you simplify it?",
      result: "What time/resources were saved?"
    }
  },
  {
    id: "q9",
    principle: "Invent and Simplify",
    question: "Tell me about an innovative idea you implemented that had significant impact.",
    context: "Think about creative solutions that drove meaningful business outcomes.",
    starFramework: {
      situation: "What opportunity did you see?",
      task: "What innovation did you propose?",
      action: "How did you implement it?",
      result: "What was the business impact?"
    }
  },
  
  // Bias for Action
  {
    id: "q10",
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
    id: "q11",
    principle: "Bias for Action",
    question: "Tell me about a time when you had to act quickly to meet a critical deadline.",
    context: "Focus on speed, decisiveness, and prioritization under pressure.",
    starFramework: {
      situation: "What was the time-sensitive challenge?",
      task: "What needed to be done?",
      action: "How did you move fast?",
      result: "Did you meet the deadline? What was delivered?"
    }
  },
  {
    id: "q12",
    principle: "Bias for Action",
    question: "Describe a time when you took a calculated risk that paid off.",
    context: "Think about balancing speed with smart decision-making.",
    starFramework: {
      situation: "What opportunity required quick action?",
      task: "What were the risks?",
      action: "How did you evaluate and proceed?",
      result: "What was the positive outcome?"
    }
  },
  
  // Hire and Develop the Best
  {
    id: "q13",
    principle: "Hire and Develop the Best",
    question: "Tell me about a time when you helped develop someone on your team who was struggling.",
    context: "Focus on talent development and raising performance standards.",
    starFramework: {
      situation: "Who needed development?",
      task: "What was your role as developer?",
      action: "What development approach did you take?",
      result: "How did they improve?"
    }
  },
  {
    id: "q14",
    principle: "Hire and Develop the Best",
    question: "Describe your approach to hiring and what you look for in candidates.",
    context: "Focus on raising the bar and building strong teams.",
    starFramework: {
      situation: "What role were you hiring for?",
      task: "What standards did you set?",
      action: "How did you evaluate candidates?",
      result: "How did the hire perform?"
    }
  },
  {
    id: "q15",
    principle: "Hire and Develop the Best",
    question: "Tell me about a time when you mentored someone and helped them advance their career.",
    context: "Think about long-term talent development and coaching.",
    starFramework: {
      situation: "Who did you mentor?",
      task: "What were their career goals?",
      action: "How did you support their development?",
      result: "What career progress did they make?"
    }
  },
  
  // Dive Deep
  {
    id: "q16",
    principle: "Dive Deep",
    question: "Tell me about a time when you had to dive deep into data or details to solve a problem.",
    context: "Focus on analytical thinking and attention to detail.",
    starFramework: {
      situation: "What problem required deep analysis?",
      task: "What details did you need to understand?",
      action: "How did you dig into the data?",
      result: "What insights did you discover?"
    }
  },
  {
    id: "q17",
    principle: "Dive Deep",
    question: "Describe a situation where surface-level information wasn't enough and you had to investigate further.",
    context: "Think about going beyond the obvious to find root causes.",
    starFramework: {
      situation: "What initially appeared to be the problem?",
      task: "Why did you need to dig deeper?",
      action: "What investigation methods did you use?",
      result: "What was the actual root cause?"
    }
  },
  {
    id: "q18",
    principle: "Dive Deep",
    question: "Tell me about a time when your attention to detail prevented a significant issue.",
    context: "Focus on thoroughness and catching problems others might miss.",
    starFramework: {
      situation: "What were you working on?",
      task: "What detail did you notice?",
      action: "How did you address it?",
      result: "What problem did you prevent?"
    }
  },
  
  // Learn and Be Curious
  {
    id: "q19",
    principle: "Learn and Be Curious",
    question: "Tell me about a time when you learned a new skill or technology to solve a problem.",
    context: "Focus on continuous learning and applying new knowledge.",
    starFramework: {
      situation: "What challenge required new knowledge?",
      task: "What did you need to learn?",
      action: "How did you acquire this knowledge?",
      result: "How did you apply it successfully?"
    }
  },
  {
    id: "q20",
    principle: "Learn and Be Curious",
    question: "Describe a time when you explored an idea or solution outside your area of expertise.",
    context: "Think about intellectual curiosity and broadening your knowledge.",
    starFramework: {
      situation: "What sparked your curiosity?",
      task: "What did you want to understand?",
      action: "How did you explore this new area?",
      result: "What value did this exploration bring?"
    }
  },
  {
    id: "q21",
    principle: "Learn and Be Curious",
    question: "Tell me about a time when you sought out feedback or learning opportunities to improve yourself.",
    context: "Focus on self-improvement and growth mindset.",
    starFramework: {
      situation: "What did you want to improve?",
      task: "What feedback did you seek?",
      action: "How did you act on that feedback?",
      result: "How did you grow as a result?"
    }
  },
  
  // Insist on the Highest Standards
  {
    id: "q22",
    principle: "Insist on the Highest Standards",
    question: "Tell me about a time when you raised the bar for quality on your team or project.",
    context: "Focus on setting and maintaining high standards.",
    starFramework: {
      situation: "What was the quality issue?",
      task: "What standard did you want to achieve?",
      action: "How did you raise the bar?",
      result: "What quality improvements resulted?"
    }
  },
  {
    id: "q23",
    principle: "Insist on the Highest Standards",
    question: "Describe a situation where you refused to compromise on quality despite pressure.",
    context: "Think about maintaining standards under challenging circumstances.",
    starFramework: {
      situation: "What pressure were you facing?",
      task: "What standard were you defending?",
      action: "How did you maintain quality?",
      result: "Why was this the right decision?"
    }
  },
  {
    id: "q24",
    principle: "Insist on the Highest Standards",
    question: "Tell me about a time when you identified and fixed a quality problem that others had overlooked.",
    context: "Focus on attention to excellence and continuous improvement.",
    starFramework: {
      situation: "What quality issue did you notice?",
      task: "Why had others missed it?",
      action: "How did you address it?",
      result: "What impact did this have?"
    }
  },
  
  // Think Big
  {
    id: "q25",
    principle: "Think Big",
    question: "Tell me about a time when you proposed a bold or ambitious vision for a project.",
    context: "Focus on thinking beyond incremental improvements.",
    starFramework: {
      situation: "What opportunity did you see?",
      task: "What bold vision did you propose?",
      action: "How did you get buy-in and execute?",
      result: "What transformational impact did it have?"
    }
  },
  {
    id: "q26",
    principle: "Think Big",
    question: "Describe a time when you challenged conventional thinking with a bigger idea.",
    context: "Think about inspiring others with a compelling long-term vision.",
    starFramework: {
      situation: "What was the conventional approach?",
      task: "What bigger idea did you have?",
      action: "How did you communicate and pursue it?",
      result: "How did it change perspectives?"
    }
  },
  {
    id: "q27",
    principle: "Think Big",
    question: "Tell me about a time when you took a long-term view that paid off.",
    context: "Focus on strategic thinking and future-oriented decisions.",
    starFramework: {
      situation: "What decision needed to be made?",
      task: "What long-term perspective did you take?",
      action: "How did you execute on this vision?",
      result: "What long-term benefits resulted?"
    }
  },
  
  // Frugality
  {
    id: "q28",
    principle: "Frugality",
    question: "Tell me about a time when you accomplished more with less resources.",
    context: "Focus on resourcefulness and efficiency.",
    starFramework: {
      situation: "What resource constraints did you face?",
      task: "What needed to be accomplished?",
      action: "How did you maximize limited resources?",
      result: "What did you achieve?"
    }
  },
  {
    id: "q29",
    principle: "Frugality",
    question: "Describe a time when you found a cost-effective alternative to an expensive solution.",
    context: "Think about being scrappy and finding creative ways to save.",
    starFramework: {
      situation: "What was the expensive approach?",
      task: "What constraints did you have?",
      action: "What alternative did you find?",
      result: "How much did you save?"
    }
  },
  {
    id: "q30",
    principle: "Frugality",
    question: "Tell me about a time when resource constraints led you to innovate.",
    context: "Focus on how limitations can drive creativity.",
    starFramework: {
      situation: "What resources were limited?",
      task: "What goal were you trying to achieve?",
      action: "What innovative approach did you take?",
      result: "What unexpected benefits came from this?"
    }
  },
  
  // Earn Trust
  {
    id: "q31",
    principle: "Earn Trust",
    question: "Tell me about a time when you had to build trust with a skeptical stakeholder.",
    context: "Focus on transparency, credibility, and following through.",
    starFramework: {
      situation: "Who was skeptical and why?",
      task: "What did you need to achieve?",
      action: "How did you earn their trust?",
      result: "How did the relationship change?"
    }
  },
  {
    id: "q32",
    principle: "Earn Trust",
    question: "Describe a situation where you had to deliver bad news or admit a mistake.",
    context: "Think about being honest and transparent even when it's difficult.",
    starFramework: {
      situation: "What was the bad news or mistake?",
      task: "Who needed to know?",
      action: "How did you communicate it?",
      result: "How did people respond to your honesty?"
    }
  },
  {
    id: "q33",
    principle: "Earn Trust",
    question: "Tell me about a time when you had to be vulnerable or ask for help.",
    context: "Focus on humility and building authentic relationships.",
    starFramework: {
      situation: "What challenge were you facing?",
      task: "What help did you need?",
      action: "How did you ask for it?",
      result: "How did this strengthen relationships?"
    }
  },
  
  // Deliver Results
  {
    id: "q34",
    principle: "Deliver Results",
    question: "Tell me about a time when you had to deliver results despite significant obstacles.",
    context: "Focus on perseverance and overcoming challenges.",
    starFramework: {
      situation: "What was the critical deliverable?",
      task: "What obstacles did you face?",
      action: "How did you overcome them?",
      result: "What did you ultimately deliver?"
    }
  },
  {
    id: "q35",
    principle: "Deliver Results",
    question: "Describe a time when you had to prioritize ruthlessly to meet a commitment.",
    context: "Think about focus and making tough trade-off decisions.",
    starFramework: {
      situation: "What commitment had you made?",
      task: "What competing priorities existed?",
      action: "How did you prioritize?",
      result: "Did you meet your commitment?"
    }
  },
  {
    id: "q36",
    principle: "Deliver Results",
    question: "Tell me about your most significant professional achievement.",
    context: "Focus on measurable impact and driving meaningful outcomes.",
    starFramework: {
      situation: "What was the challenging goal?",
      task: "What was your role?",
      action: "How did you drive results?",
      result: "What measurable impact did you create?"
    }
  },
  
  // Strive to be Earth's Best Employer
  {
    id: "q37",
    principle: "Strive to be Earth's Best Employer",
    question: "Tell me about a time when you took action to improve your team's work environment or culture.",
    context: "Focus on creating a safe, productive, and inclusive workplace.",
    starFramework: {
      situation: "What issue did you notice?",
      task: "What needed to improve?",
      action: "What changes did you implement?",
      result: "How did team morale or productivity improve?"
    }
  },
  {
    id: "q38",
    principle: "Strive to be Earth's Best Employer",
    question: "Describe a time when you advocated for the well-being or growth of your team members.",
    context: "Think about investing in people and their development.",
    starFramework: {
      situation: "What was affecting your team?",
      task: "What did you advocate for?",
      action: "How did you make the case?",
      result: "What improved for the team?"
    }
  },
  {
    id: "q39",
    principle: "Strive to be Earth's Best Employer",
    question: "Tell me about a time when you created an inclusive environment for diverse perspectives.",
    context: "Focus on building belonging and psychological safety.",
    starFramework: {
      situation: "What diversity challenge existed?",
      task: "What change was needed?",
      action: "How did you promote inclusion?",
      result: "How did team dynamics improve?"
    }
  },
  
  // Success and Scale Bring Broad Responsibility
  {
    id: "q40",
    principle: "Success and Scale Bring Broad Responsibility",
    question: "Tell me about a time when you considered the broader impact of your decisions beyond immediate business goals.",
    context: "Focus on social responsibility and long-term thinking.",
    starFramework: {
      situation: "What decision were you making?",
      task: "What broader impacts did you consider?",
      action: "How did you balance different stakeholders?",
      result: "What was the holistic outcome?"
    }
  },
  {
    id: "q41",
    principle: "Success and Scale Bring Broad Responsibility",
    question: "Describe a time when you took action to benefit your community or society, not just your company.",
    context: "Think about corporate responsibility and giving back.",
    starFramework: {
      situation: "What opportunity did you see?",
      task: "What responsibility did you feel?",
      action: "What initiative did you take?",
      result: "What positive impact did you create?"
    }
  },
  {
    id: "q42",
    principle: "Success and Scale Bring Broad Responsibility",
    question: "Tell me about a time when you advocated for sustainable or ethical practices.",
    context: "Focus on doing the right thing for the long term.",
    starFramework: {
      situation: "What practice concerned you?",
      task: "What change did you propose?",
      action: "How did you advocate for it?",
      result: "What lasting impact did this have?"
    }
  },
  
  // Have Backbone; Disagree and Commit
  {
    id: "q43",
    principle: "Have Backbone; Disagree and Commit",
    question: "Tell me about a time when you disagreed with a decision but committed to it fully.",
    context: "Focus on respectful disagreement and full commitment once decided.",
    starFramework: {
      situation: "What was the decision?",
      task: "Why did you disagree?",
      action: "How did you commit after the decision?",
      result: "What was the outcome?"
    }
  },
  {
    id: "q44",
    principle: "Have Backbone; Disagree and Commit",
    question: "Describe a time when you challenged a decision made by senior leadership.",
    context: "Think about respectfully speaking up even when it's uncomfortable.",
    starFramework: {
      situation: "What decision did you challenge?",
      task: "What was your concern?",
      action: "How did you voice your disagreement?",
      result: "What happened as a result?"
    }
  },
  {
    id: "q45",
    principle: "Have Backbone; Disagree and Commit",
    question: "Tell me about a time when you had to deliver an unpopular message or decision.",
    context: "Focus on having conviction and standing by difficult decisions.",
    starFramework: {
      situation: "What was the unpopular decision?",
      task: "Why was it necessary?",
      action: "How did you communicate and stand firm?",
      result: "How did people eventually respond?"
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
