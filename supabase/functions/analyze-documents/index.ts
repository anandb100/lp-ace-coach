import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Analyze-documents function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const requestBody = await req.json();
    console.log('Request body keys:', Object.keys(requestBody));
    
    const { resumeContent, jobDescriptionContent } = requestBody;
    
    if (!resumeContent || !jobDescriptionContent) {
      console.error('Missing content:', { hasResume: !!resumeContent, hasJobDesc: !!jobDescriptionContent });
      throw new Error('Both resume and job description content are required');
    }
    
    console.log('Resume content length:', resumeContent.length);
    console.log('Job description content length:', jobDescriptionContent.length);
    console.log('Analyzing documents with OpenAI...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not found');
    }
    console.log('OpenAI API key found');

    // Analyze job description to identify relevant leadership principles and generate questions
    const analysisPrompt = `
    You are an expert Amazon interview coach. Analyze the following job description to:
    
    1. Identify the 5 most relevant Amazon Leadership Principles for this role
    2. Generate 3 specific behavioral interview questions based on these principles
    3. Provide relevance scores (1-100) for each principle based on the job requirements
    
    Job Description:
    ${jobDescriptionContent}
    
    Amazon's 16 Leadership Principles are:
    1. Customer Obsession
    2. Ownership  
    3. Invent and Simplify
    4. Are Right, A Lot
    5. Learn and Be Curious
    6. Hire and Develop the Best
    7. Insist on the Highest Standards
    8. Think Big
    9. Bias for Action
    10. Frugality
    11. Earn Trust
    12. Dive Deep
    13. Have Backbone; Disagree and Commit
    14. Deliver Results
    15. Strive to be Earth's Best Employer
    16. Success and Scale Bring Broad Responsibility
    
    Respond in this exact JSON format:
    {
      "principles": [
        {
          "id": "customer-obsession",
          "title": "Customer Obsession",
          "description": "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.",
          "relevanceScore": 95,
          "keyBehaviors": ["Customer-first thinking", "Data-driven decisions", "Long-term relationship building"]
        }
      ],
      "questions": [
        {
          "id": "q1",
          "principle": "Customer Obsession",
          "question": "Tell me about a time when you had to make a decision between what was best for the customer and what was easier for your company or team.",
          "context": "Focus on a situation where customer needs conflicted with internal processes or constraints.",
          "starFramework": {
            "situation": "Describe the context and customer need",
            "task": "What was your responsibility?",
            "action": "What steps did you take?",
            "result": "What was the customer impact?"
          }
        }
      ]
    }
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
            content: 'You are an expert Amazon interview coach. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
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
    console.log('Full AI response:', JSON.stringify(aiResponse, null, 2));
    
    const messageContent = aiResponse.choices?.[0]?.message?.content;
    console.log('Message content:', messageContent);
    
    if (!messageContent || messageContent.trim() === '') {
      console.error('Empty response from OpenAI');
      throw new Error('OpenAI returned empty response. Please try again.');
    }
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(messageContent);
      console.log('Successfully parsed analysis result');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', messageContent);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    console.log('Returning successful response');
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-documents function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to analyze documents with OpenAI',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});