import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw } from "lucide-react";

interface QuestionResult {
  questionNumber: number;
  principle: string;
  question: string;
  score: number;
  keyImprovements: string[];
}

interface FinalResultsProps {
  overallScore: number;
  questionResults: QuestionResult[];
  onStartNew: () => void;
}

const FinalResults = ({ overallScore, questionResults, onStartNew }: FinalResultsProps) => {
  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return "Excellent Performance! 🚀";
    if (score >= 60) return "Good Performance! 👍";
    return "Needs Improvement 📈";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Interview Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Here's your comprehensive performance summary
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="shadow-elegant mb-8 bg-gradient-primary text-white">
          <CardContent className="text-center py-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold">{overallScore}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Average Score</h2>
            <p className="text-xl opacity-90">{getPerformanceLevel(overallScore)}</p>
          </CardContent>
        </Card>

        {/* Leadership Principles Breakdown */}
        <div className="space-y-6 mb-8">
          {questionResults.map((result) => (
            <Card key={result.questionNumber} className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.principle}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      Average: {result.score}/100
                    </Badge>
                  </div>
                  <Badge variant={getScoreVariant(result.score)}>
                    Question {result.questionNumber}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  {result.question}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key improvements:</h4>
                  <ul className="space-y-1">
                    {result.keyImprovements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button 
            onClick={onStartNew}
            size="lg"
            className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start New Session
          </Button>
          <p className="text-sm text-muted-foreground">
            Practice makes perfect! Try another round to improve your scores.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalResults;