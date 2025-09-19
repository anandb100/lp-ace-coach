import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-interview.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Master Amazon's{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Leadership Principles
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Upload your resume and job description. Get personalized interview questions, 
              record your responses, and receive detailed STAR framework analysis to ace your Amazon interview.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
            >
              Start Interview Prep
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/40">
              Learn More
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Targeted Questions</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-sm font-medium">STAR Analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm font-medium">Detailed Feedback</span>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden shadow-elegant">
            <img 
              src={heroImage} 
              alt="Professional interview preparation"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
          </div>
          
          {/* Floating Cards */}
          <div className="absolute -top-4 -left-4 bg-card rounded-lg shadow-card p-4 border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm font-medium">Leadership Principles Matched</span>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -right-4 bg-card rounded-lg shadow-card p-4 border">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Voice Analysis Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;