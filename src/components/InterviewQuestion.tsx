import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Pause, RotateCcw, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  principle: string;
  question: string;
  context: string;
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface InterviewQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmitted: (answer: { audioBlob: Blob; transcript: string }) => void;
  onNext: () => void;
}

const InterviewQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswerSubmitted, 
  onNext 
}: InterviewQuestionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      
      audio.play();
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setHasRecorded(false);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const submitAnswer = () => {
    if (audioBlob) {
      // Mock transcript for demo
      const mockTranscript = "This is a sample transcript of the recorded answer. In a real application, this would be generated using speech-to-text technology.";
      onAnswerSubmitted({ audioBlob, transcript: mockTranscript });
      onNext();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto w-full">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge className="bg-primary/10 text-primary">
              {question.principle}
            </Badge>
          </div>
          <Progress value={(questionNumber / totalQuestions) * 100} className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Progress: {Math.round((questionNumber / totalQuestions) * 100)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Interview Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-medium mb-2">{question.question}</p>
              <p className="text-muted-foreground">{question.context}</p>
            </div>

            {/* STAR Framework Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-sm mb-1">Situation</h4>
                <p className="text-xs text-muted-foreground">{question.starFramework.situation}</p>
              </div>
              <div className="p-3 bg-secondary/5 rounded-lg border-l-4 border-secondary">
                <h4 className="font-semibold text-sm mb-1">Task</h4>
                <p className="text-xs text-muted-foreground">{question.starFramework.task}</p>
              </div>
              <div className="p-3 bg-accent/5 rounded-lg border-l-4 border-accent">
                <h4 className="font-semibold text-sm mb-1">Action</h4>
                <p className="text-xs text-muted-foreground">{question.starFramework.action}</p>
              </div>
              <div className="p-3 bg-success/5 rounded-lg border-l-4 border-success">
                <h4 className="font-semibold text-sm mb-1">Result</h4>
                <p className="text-xs text-muted-foreground">{question.starFramework.result}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Record Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              {/* Recording Status */}
              <div className="text-2xl font-mono">
                {formatTime(recordingTime)}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center gap-3">
                {!isRecording && !hasRecorded && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    variant="destructive"
                    className="animate-pulse"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                )}

                {hasRecorded && !isRecording && (
                  <div className="flex gap-2">
                    <Button
                      onClick={isPlaying ? pauseRecording : playRecording}
                      variant="outline"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button onClick={resetRecording} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                    >
                      Submit Answer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Recording Tips */}
              <div className="text-sm text-muted-foreground max-w-md mx-auto">
                <p>💡 Tips for a great answer:</p>
                <ul className="list-disc list-inside text-left space-y-1 mt-2">
                  <li>Structure your response using the STAR method</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Aim for 2-4 minutes per response</li>
                  <li>Include specific metrics and outcomes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewQuestion;