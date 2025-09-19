import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, CheckCircle, ArrowRight, Star } from "lucide-react";

interface AnalysisScore {
  category: string;
  score: number;
  feedback: string;
  improvement: string;
}

interface AnalysisResultsProps {
  questionNumber: number;
  totalQuestions: number;
  transcript: string;
  scores: AnalysisScore[];
  overallScore: number;
  onNext: () => void;
  isLastQuestion: boolean;
}

const AnalysisResults = ({ 
  questionNumber, 
  totalQuestions, 
  transcript, 
  scores, 
  overallScore,
  onNext,
  isLastQuestion
}: AnalysisResultsProps) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Response Analysis</h2>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge className={`${getScoreColor(overallScore)} bg-current/10`}>
              Overall Score: {overallScore}/100
            </Badge>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="shadow-card mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Overall Performance
            </CardTitle>
            <div className="text-6xl font-bold mt-4 mb-2">
              <span className={getScoreColor(overallScore)}>{overallScore}</span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Progress value={overallScore} className="w-full max-w-md mx-auto" />
          </CardHeader>
        </Card>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {scores.map((score, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{score.category}</CardTitle>
                  <Badge variant={getScoreBadgeVariant(score.score)}>
                    {score.score}
                  </Badge>
                </div>
                <Progress value={score.score} className="h-2" />
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
                  {score.feedback}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transcript */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Your Response Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-sm leading-relaxed">{transcript}</p>
              </div>
            </CardContent>
          </Card>

          {/* STAR Analysis & Improvements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">STAR Framework Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scores.map((score, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {score.score >= 70 ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : score.score >= 50 ? (
                      <TrendingUp className="h-4 w-4 text-warning" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-medium text-sm">{score.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    {score.improvement}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Improvement Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scores
                .filter(score => score.score < 80)
                .map((score, index) => (
                  <div key={index} className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <h4 className="font-medium text-sm mb-1">{score.category}</h4>
                    <p className="text-xs text-muted-foreground">{score.improvement}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button 
            onClick={onNext}
            size="lg"
            className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
          >
            {isLastQuestion ? "View Final Results" : "Continue to Next Question"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {!isLastQuestion && (
            <p className="text-sm text-muted-foreground mt-3">
              {totalQuestions - questionNumber} questions remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;