import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Extract-relevant-resume function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, questionText, leadershipPrinciple } = await req.json();
    
    if (!resumeContent || !questionText) {
      throw new Error('Resume content and question are required');
    }
    
    console.log('Full resume length:', resumeContent.length);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const extractionPrompt = `Extract only the most relevant sections from this resume for answering the specific interview question below.

Question: ${questionText}
Leadership Principle: ${leadershipPrinciple || 'Not specified'}

Full Resume:
${resumeContent}

INSTRUCTIONS:
1. Extract ONLY experiences, projects, skills, and achievements directly relevant to this question and leadership principle
2. Keep specific metrics, dates, company names, and quantifiable achievements
3. Target output: 2000-3000 words maximum
4. Focus on quality over quantity - only include what's needed to answer this question
5. Maintain chronological order and context
6. Include role titles, company names, and timeframes for relevant positions
7. Preserve all numbers, percentages, and concrete results

Return the condensed resume as plain text, structured and ready to use for interview analysis.`;

    console.log('Calling OpenAI to extract relevant sections...');
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
            content: 'You are a resume extraction expert. Extract only the most relevant information from resumes based on specific interview questions.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const condensedResume = aiResponse.choices[0].message.content;
    
    console.log('Condensed resume length:', condensedResume.length);
    console.log('Reduction:', Math.round((1 - condensedResume.length / resumeContent.length) * 100) + '%');

    return new Response(JSON.stringify({ condensedResume }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-relevant-resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to extract relevant resume sections'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
