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

    4 Sections should be there in the Analysis. Section 1 – Overall Score out of 100. Give an overall score based on the quality of the answer. Give a 1-liner feedback.
    Section 2 - STAR Framework Analysis. It should be in the format as shown below.
    Section 3 – Suggested STAR Answer. It should be in the format as shown below.
    Section 4 - Why this answer aligns to the JD. It should be in the format as shown below.

    Question Asked: ${questionText}
    Leadership Principle: ${leadershipPrinciple}
    User's Response: ${userResponse}
    
    User's Resume:
    ${resumeContent}
    
    Job Description:
    ${jobDescriptionContent}

    Please provide analysis in this exact JSON format:
    {
      "overallScore": {
        "score": 78,
        "feedback": "Strong potential with clearer metrics and mechanisms"
      },
      "starAnalysis": {
        "situation": {
          "score": 82,
          "feedback": "Ambiguity and high stakes options are evident, but urgency signals (runway, customer churn risk, unit economics) should be explicit to show why speed mattered now."
        },
        "task": {
          "score": 78,
          "feedback": "Decision objective is implied, but success criteria and a decision deadline are missing; define the bar and timebox to evidence judgment under limited data."
        },
        "action": {
          "score": 74,
          "feedback": "States a choice but lacks concrete actions taken to de risk speed (pilot design, supplier terms, guardrails, metrics cadence, stakeholder alignment)."
        },
        "result": {
          "score": 72,
          "feedback": "Outcome is described as mixed without quantified results, lessons, or mechanisms institutionalized; Amazon expects measurable impact and learning loops even when results are imperfect."
        }
      },
      "suggestedAnswer": {
        "situation": "Six months after a pivot at HealthBeacon, sales pipeline softened and 45 day cash cycles created a three month runway risk; four paths existed—continue pivot, launch private label, rejoin Entero, or accept Reliance's offer—with incomplete market and margin data.",
        "task": "Make a reversible, time boxed decision within two weeks to preserve cash and validate a higher margin model; success bar: ≥18% gross margin, ≤10 day cash conversion, ≥60% reorder rate from a limited cohort while capping working capital exposure to ≤INR 15 lakhs.",
        "action": "Ran a 10 day sprint to negotiate low MOQ SLAs with two manufacturers, assembled a 50 SKU pilot from fast moving OTC/surgical categories, launched a geo fenced pilot to 50 chemists with guardrails (OTIF ≥95%, defect ≤2%, stop loss at INR 10 lakhs), and instituted daily metric reviews allowing 24 hour price/SKU pivots and two decision gates (Day 7 and Day 14).",
        "result": "By Day 14, achieved 19.6% GM, 9 day cash conversion, 64% reorder rate, and 96.8% OTIF; scaled to 80 SKUs and 1,500 chemists with INR 3 Cr Year 2 revenue; later margin compression at scale prompted exits from two categories, stricter supplier scorecards, and tighter credit terms, preserving cash and codifying mechanisms for faster, safer decisions in future programs."
      },
      "jobAlignment": [
        "Balances speed and precision via timeboxes, guardrails, and reversible pilots—mirrors POE's mandate to act rapidly on emerging risks without harming good actors.",
        "Uses data and metrics to determine improvements and communicates clear thresholds and results, matching expectations to define program requirements and report to leadership.",
        "Demonstrates portable mechanisms: geo fenced rollouts, stop loss triggers, supplier/partner scorecards, and daily metric cadences that can localize global policies for India."
      ]
    }

    Provide actual analysis based on the user's specific response and context. Don't copy the example format exactly, but use it as a structure reference.
    `;

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
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
        max_completion_tokens: 3000,
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