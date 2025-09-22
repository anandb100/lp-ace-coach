import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, jobDescriptionContent } = await req.json();
    
    console.log('Analyzing documents with OpenAI...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Analyze job description to identify relevant leadership principles and generate questions
    const analysisPrompt = `
    You are an expert Amazon interview coach. Analyze the following job description and resume to:
    
    1. Identify the 5 most relevant Amazon Leadership Principles for this role
    2. Generate 5 specific behavioral interview questions based on these principles
    3. Provide relevance scores (1-100) for each principle based on the job requirements
    
    Job Description:
    ${jobDescriptionContent}
    
    Resume:
    ${resumeContent}
    
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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received');
    
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-documents function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to analyze documents with OpenAI'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});