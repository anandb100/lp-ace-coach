import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Analyze-response function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const requestBody = await req.json();
    console.log('Request body keys:', Object.keys(requestBody));
    
    const { questionText, userResponse, resumeContent, jobDescriptionContent, leadershipPrinciple } = requestBody;
    
    if (!questionText || !userResponse || !resumeContent || !jobDescriptionContent) {
      console.error('Missing required content:', { 
        hasQuestion: !!questionText, 
        hasResponse: !!userResponse, 
        hasResume: !!resumeContent, 
        hasJobDesc: !!jobDescriptionContent 
      });
      throw new Error('All required content (question, response, resume, job description) are required');
    }
    
    console.log('User response length:', userResponse.length);
    console.log('Resume content length:', resumeContent.length);
    console.log('Job description content length:', jobDescriptionContent.length);
    console.log('Analyzing response with OpenAI...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not found');
    }
    console.log('OpenAI API key found');

    // Analyze user response based on Amazon interview standards
    const analysisPrompt = `
    Assume you are an Amazon HR recruiting expert interviewer. You are interviewing the user. You asked him the question and he has given the response. Now, analyse the user response in the context of his CV and then give him a comprehensive analysis of his answer with respect to the question. Use the STAR framework.

    4 Sections should be there in the Analysis:
    Section 1 – Overall Score out of 100. Give an overall score based on the quality of the answer. Give a 1-liner feedback.
    Section 2 - STAR Framework Analysis. Analyze each STAR component with a score (0-100) and specific feedback.
    Section 3 – Suggested STAR Answer. CRITICAL: Each component (Situation, Task, Action, Result) must be a detailed, comprehensive paragraph (100-150 words each) with specific metrics, timelines, and concrete details from the user's actual resume.
    Section 4 - Why this answer aligns to the JD. Provide 3-5 specific alignment points.

    Question Asked: ${questionText}
    Leadership Principle: ${leadershipPrinciple}
    User's Response: ${userResponse}
    
    User's Relevant Resume Sections:
    ${resumeContent}
    
    Job Description:
    ${jobDescriptionContent}

    Please provide analysis in this exact JSON format:
    {
      "overallScore": {
        "score": <number 0-100>,
        "feedback": "<concise 1-liner feedback>"
      },
      "starAnalysis": {
        "situation": {
          "score": <number 0-100>,
          "feedback": "<specific feedback on situation setup>"
        },
        "task": {
          "score": <number 0-100>,
          "feedback": "<specific feedback on task definition>"
        },
        "action": {
          "score": <number 0-100>,
          "feedback": "<specific feedback on actions taken>"
        },
        "result": {
          "score": <number 0-100>,
          "feedback": "<specific feedback on results and impact>"
        }
      },
      "suggestedAnswer": {
        "situation": "<detailed 100-150 word paragraph with specific context, numbers, and timeline>",
        "task": "<detailed 100-150 word paragraph with clear objective, success criteria, and constraints>",
        "action": "<detailed 100-150 word paragraph with specific actions, methods, and stakeholder engagement>",
        "result": "<detailed 100-150 word paragraph with quantified outcomes, learnings, and long-term impact>"
      },
      "jobAlignment": [
        "<specific alignment point 1>",
        "<specific alignment point 2>",
        "<specific alignment point 3>"
      ]
    }

    CRITICAL INSTRUCTIONS:
    - Each STAR component in suggestedAnswer MUST be a full, detailed paragraph (100-150 words minimum)
    - Use specific numbers, metrics, timelines, and concrete details from the user's resume
    - The suggested answer should serve as a model answer for Amazon interviews
    - Do NOT provide short, bullet-point style answers - write flowing, detailed paragraphs
    - Focus on the user's actual experience and achievements
    `;

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Amazon HR recruiting interviewer. Always respond with valid JSON only and provide comprehensive, detailed analysis.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    console.log('Parsing OpenAI response...');
    const aiResponse = await response.json();
    console.log('OpenAI response received, parsing content...');
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse.choices[0].message.content);
      console.log('Successfully parsed analysis result');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', aiResponse.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Returning successful response');
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-response function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to analyze response with OpenAI',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});