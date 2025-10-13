import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

interface STARAnalysis {
  situation: { score: number; feedback: string; };
  task: { score: number; feedback: string; };
  action: { score: number; feedback: string; };
  result: { score: number; feedback: string; };
}

interface SuggestedAnswer {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface OverallScore {
  score: number;
  feedback: string;
}

interface QuestionFeedbackProps {
  questionNumber: number;
  totalQuestions: number;
  transcript: string;
  overallScore: OverallScore;
  starAnalysis: STARAnalysis;
  suggestedAnswer: SuggestedAnswer;
  jobAlignment: string[];
  onNext: () => void;
  isLastQuestion: boolean;
}

const QuestionFeedback = ({
  questionNumber,
  totalQuestions,
  transcript,
  overallScore,
  starAnalysis,
  suggestedAnswer,
  jobAlignment,
  onNext,
  isLastQuestion
}: QuestionFeedbackProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Response Analysis</h1>
          <p className="text-muted-foreground">Question {questionNumber} of {totalQuestions}</p>
        </div>

        {/* Your Response */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Your Response:</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{transcript}</p>
          </CardContent>
        </Card>

        {/* Section 1: Overall Score */}
        <Card className="shadow-card text-center bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Section 1: Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white">
                <span className="text-3xl font-bold">{overallScore.score}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{overallScore.score}/100</h3>
            <p className="text-blue-800 text-sm font-medium">{overallScore.feedback}</p>
          </CardContent>
        </Card>

        {/* Section 2: STAR Framework Analysis */}
        <Card className="shadow-card bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Section 2: STAR Framework Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(starAnalysis).map(([key, analysis]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize text-green-800">{key}</h4>
                  <span className={`font-semibold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </span>
                </div>
                <Progress value={analysis.score} className="h-2" />
                <p className="text-sm text-green-700">{analysis.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 3: Suggested STAR Answer */}
        <Card className="shadow-card bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Lightbulb className="h-5 w-5" />
              Section 3: Suggested STAR Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedAnswer && Object.entries(suggestedAnswer).map(([key, value]) => (
              value && (
                <div key={key} className="space-y-2">
                  <h4 className="font-medium capitalize text-purple-800">{key}:</h4>
                  <p className="text-sm text-purple-700 bg-white/60 p-3 rounded-md border border-purple-200">
                    {value}
                  </p>
                </div>
              )
            ))}
            {(!suggestedAnswer || Object.values(suggestedAnswer).every(v => !v)) && (
              <p className="text-sm text-purple-700 italic">Loading suggested answer...</p>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Job Alignment */}
        <Card className="shadow-card bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <CheckCircle className="h-5 w-5" />
              Section 4: Why this answer aligns to the JD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jobAlignment.map((alignment, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-orange-800">{alignment}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Button */}
        <div className="text-center">
          <Button 
            onClick={onNext}
            size="lg"
            className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
          >
            {isLastQuestion ? "View Final Results" : "Next Question"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionFeedback;