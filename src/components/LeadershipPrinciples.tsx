import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Target, ArrowRight, Lightbulb } from "lucide-react";

interface LeadershipPrinciple {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  keyBehaviors: string[];
}

interface LeadershipPrinciplesProps {
  analysisResult?: any;
  onPrinciplesSelected: (principles: LeadershipPrinciple[]) => void;
  onNext: (focusedPrinciple?: LeadershipPrinciple) => void;
}

// Mock data - in real app this would come from AI analysis
const mockPrinciples: LeadershipPrinciple[] = [
  {
    id: "customer-obsession",
    title: "Customer Obsession",
    description: "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.",
    relevanceScore: 95,
    keyBehaviors: ["Customer-first thinking", "Data-driven decisions", "Long-term relationship building"]
  },
  {
    id: "ownership",
    title: "Ownership",
    description: "Leaders are owners. They think long term and don't sacrifice long-term value for short-term results.",
    relevanceScore: 88,
    keyBehaviors: ["Taking responsibility", "Long-term thinking", "Acting on behalf of the company"]
  },
  {
    id: "invent-simplify",
    title: "Invent and Simplify",
    description: "Leaders expect and require innovation and invention from their teams and always find ways to simplify.",
    relevanceScore: 85,
    keyBehaviors: ["Creative problem solving", "Process optimization", "Innovation mindset"]
  },
  {
    id: "bias-for-action",
    title: "Bias for Action",
    description: "Speed matters in business. Many decisions and actions are reversible and do not need extensive study.",
    relevanceScore: 82,
    keyBehaviors: ["Quick decision making", "Calculated risk taking", "Execution focus"]
  },
  {
    id: "hire-develop",
    title: "Hire and Develop the Best",
    description: "Leaders raise the performance bar with every hire and promotion. They recognize exceptional talent.",
    relevanceScore: 78,
    keyBehaviors: ["Talent identification", "Team development", "Performance standards"]
  }
];

const LeadershipPrinciples = ({ analysisResult, onPrinciplesSelected, onNext }: LeadershipPrinciplesProps) => {
  const [selectedPrinciples] = useState<LeadershipPrinciple[]>(
    (analysisResult?.principles || mockPrinciples.slice(0, 5)).sort((a, b) => b.relevanceScore - a.relevanceScore)
  );
  const [analysisComplete, setAnalysisComplete] = useState(!!analysisResult);

  // Simulate analysis progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAnalysisComplete(true);
            onPrinciplesSelected(selectedPrinciples);
            return 100;
          }
          return prev + 15;
        });
      }, 300);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Leadership Principles Analysis</h2>
          <p className="text-muted-foreground">
            Based on your job description, we've identified the most relevant Amazon Leadership Principles
          </p>
        </div>

        {/* Analysis Progress */}
        {!analysisComplete && (
          <Card className="shadow-card mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Analyzing job requirements...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Matching role requirements with Amazon's 16 Leadership Principles
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {analysisComplete && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {selectedPrinciples.map((principle, index) => (
                <Card key={principle.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {principle.relevanceScore}% match
                        </Badge>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                    <CardDescription>{principle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Key Behaviors to Demonstrate
                      </h4>
                      <div className="space-y-2">
                        {principle.keyBehaviors.map((behavior, behaviorIndex) => (
                          <div key={behaviorIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span>{behavior}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => onNext(principle)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      Focus on this principle
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={() => onNext()}
                size="lg"
                className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
              >
                Start with All Principles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Or click on a specific principle above to focus your practice
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadershipPrinciples;