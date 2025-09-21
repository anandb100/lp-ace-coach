import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

interface FeedbackScore {
  category: string;
  score: number;
  feedback: string;
  improvement: string;
}

interface STARAnalysis {
  situation: { score: number; feedback: string; };
  task: { score: number; feedback: string; };
  action: { score: number; feedback: string; };
  result: { score: number; feedback: string; };
}

interface QuestionFeedbackProps {
  questionNumber: number;
  totalQuestions: number;
  transcript: string;
  scores: FeedbackScore[];
  overallScore: number;
  starAnalysis: STARAnalysis;
  strengths: string[];
  improvements: string[];
  onNext: () => void;
  isLastQuestion: boolean;
}

const QuestionFeedback = ({
  questionNumber,
  totalQuestions,
  transcript,
  scores,
  overallScore,
  starAnalysis,
  strengths,
  improvements,
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

        {/* Overall Score */}
        <Card className="shadow-card text-center">
          <CardContent className="pt-6">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center text-white">
                <span className="text-3xl font-bold">{overallScore}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
            <Badge variant={getScoreVariant(overallScore)} className="text-sm">
              {overallScore >= 80 ? "Strong Performance" : overallScore >= 60 ? "Good Performance" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>

        {/* STAR Framework Analysis */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>STAR Framework Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(starAnalysis).map(([key, analysis]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">{key}</h4>
                  <span className={`font-semibold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </span>
                </div>
                <Progress value={analysis.score} className="h-2" />
                <p className="text-sm text-muted-foreground">{analysis.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="shadow-card bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></div>
                  <span className="text-green-800">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="shadow-card bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2"></div>
                  <span className="text-orange-800">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="shadow-card bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Lightbulb className="h-5 w-5" />
              Suggestions for Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              Consider adding specific metrics like 'reduced processing time by 40%' or 'saved the 
              team 20 hours per week' to make your impact more tangible.
            </p>
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