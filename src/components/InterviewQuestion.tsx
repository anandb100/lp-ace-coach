import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, ArrowRight, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  onAnswerSubmitted: (answer: { 
    audioBlob: Blob; 
    transcript: string;
    analysisData?: any;
  }) => void;
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
  const [transcript, setTranscript] = useState("");
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef("");
  const { toast } = useToast();

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        
        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: `Error: ${event.error}. You can type your response directly.`,
          variant: "destructive",
        });
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Please type your response.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);


  const startRecording = async () => {
    try {
      // Start audio recording for storage
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setHasRecorded(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Start speech recognition
      if (recognitionRef.current) {
        finalTranscriptRef.current = "";
        setTranscript("");
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone.",
      });

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
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Recording Stopped",
        description: "Your response has been captured.",
      });
    }
  };


  const getAIFeedback = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Response",
        description: "Please record or type your response first.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingFeedback(true);
    try {
      // Use constant dummy user ID for all sessions
      const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';
      
      // Create or get the interview session
      const { data: existingSessions } = await supabase
        .from('interview_sessions')
        .select()
        .eq('user_id', DUMMY_USER_ID)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

      let currentSessionId: string;
      
      if (existingSessions && existingSessions.length > 0) {
        currentSessionId = existingSessions[0].id;
      } else {
        const sessionId = crypto.randomUUID();
        const { error: sessionError } = await supabase
          .from('interview_sessions')
          .insert({
            id: sessionId,
            user_id: DUMMY_USER_ID,
            status: 'in_progress',
          });

        if (sessionError) {
          console.error('Error creating session:', sessionError);
          toast({
            title: "Error",
            description: "Failed to create session.",
            variant: "destructive",
          });
          setIsGettingFeedback(false);
          return;
        }
        currentSessionId = sessionId;
      }

      // Get resume and job description from database
      const { data: documents } = await supabase
        .from('documents')
        .select('type, content')
        .eq('user_id', DUMMY_USER_ID)
        .in('type', ['resume', 'job_description'])
        .order('created_at', { ascending: false });

      const resume = documents?.find(d => d.type === 'resume')?.content || '';
      const jobDescription = documents?.find(d => d.type === 'job_description')?.content || '';

      if (!resume || !jobDescription) {
        toast({
          title: "Missing Documents",
          description: "Please upload your resume and job description first.",
          variant: "destructive",
        });
        setIsGettingFeedback(false);
        return;
      }

      // Step 1: Extract relevant resume sections
      console.log('Extracting relevant resume sections...');
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-relevant-resume', {
        body: {
          resumeContent: resume,
          questionText: question.question,
          leadershipPrinciple: question.principle,
        },
      });

      if (extractionError || !extractionData?.condensedResume) {
        console.error('Error extracting resume sections:', extractionError);
        toast({
          title: "Error",
          description: "Failed to process resume. Please try again.",
          variant: "destructive",
        });
        setIsGettingFeedback(false);
        return;
      }

      console.log('Resume extracted successfully, original length:', resume.length, 'condensed length:', extractionData.condensedResume.length);

      // Step 2: Call the analyze-response function with condensed resume
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-response', {
        body: {
          questionText: question.question,
          userResponse: transcript,
          resumeContent: extractionData.condensedResume,
          jobDescriptionContent: jobDescription,
          leadershipPrinciple: question.principle,
        },
      });

      if (analysisError) {
        console.error('Error getting AI feedback:', analysisError);
        toast({
          title: "Error",
          description: "Failed to get AI feedback. Please try again.",
          variant: "destructive",
        });
        setIsGettingFeedback(false);
        return;
      }

      console.log('Analysis data received:', analysisData);
      console.log('Suggested Answer:', analysisData?.suggestedAnswer);

      // Save the response with feedback
      const { error: responseError } = await supabase
        .from('interview_responses')
        .insert({
          session_id: currentSessionId,
          user_id: DUMMY_USER_ID,
          question_number: questionNumber,
          question_text: question.question,
          transcribed_text: transcript,
          leadership_principle: question.principle,
          overall_score: analysisData.overallScore.score,
          feedback: analysisData.overallScore.feedback,
          star_analysis: analysisData.starAnalysis,
          audio_url: audioBlob ? URL.createObjectURL(audioBlob) : null,
        });

      if (responseError) {
        console.error('Error saving response:', responseError);
      }

      toast({
        title: "AI Feedback Generated",
        description: "Your response has been analyzed successfully.",
      });

      // Call onAnswerSubmitted with the analysis data to trigger feedback display
      onAnswerSubmitted({
        audioBlob: audioBlob!,
        transcript,
        analysisData,
      });
    } catch (error) {
      console.error('Error in getAIFeedback:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    if (audioBlob && transcript) {
      onAnswerSubmitted({ audioBlob, transcript });
    }
    onNext();
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
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interview Question
            </CardTitle>
            <p className="text-sm text-muted-foreground">Focus: {question.principle}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-lg font-medium mb-2">{question.question}</p>
            </div>

            {/* Follow-up Questions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Follow-up Questions:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• What specific actions did you take to ensure the customer's voice was heard?</li>
                <li>• How did you measure the impact of your advocacy on customer satisfaction?</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Response Interface */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div className="flex justify-center">
              {!isRecording && !hasRecorded && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="text-center space-y-4">
                  <div className="text-2xl font-mono text-red-600">
                    {formatTime(recordingTime)}
                  </div>
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    variant="destructive"
                    className="animate-pulse px-8"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                </div>
              )}
            </div>

            {/* Transcript Text Area */}
            <div className="space-y-2">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your response will appear here in real-time as you speak, or you can type directly..."
                className="min-h-[200px] resize-none"
                disabled={isRecording}
              />
              {isRecording && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
                  Listening and transcribing in real-time...
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={getAIFeedback}
                variant="outline"
                disabled={!transcript.trim() || isGettingFeedback}
                className="px-6"
              >
                {isGettingFeedback ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    Getting Feedback...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Get AI Feedback
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6"
                disabled={!transcript.trim()}
              >
                Next Question
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewQuestion;