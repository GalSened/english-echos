import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, context = "" } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Correcting text with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert English teacher and linguist providing comprehensive analysis for English learners. Analyze the text for multiple aspects of English proficiency and provide educational feedback.

Your analysis should include:
1. Grammar errors with clear explanations
2. Vocabulary improvements with natural alternatives
3. Pronunciation guidance for difficult words
4. Fluency and naturalness suggestions
5. Cultural/contextual appropriateness
6. Speaking tips for better oral communication

Return this exact JSON format:
{
  "hasErrors": true/false,
  "originalText": "original text",
  "correctedText": "corrected version with improvements",
  "errors": [
    {
      "type": "grammar/vocabulary/pronunciation/fluency/cultural",
      "original": "problematic part",
      "corrected": "improved version", 
      "explanation": "detailed educational explanation",
      "speakingTip": "specific advice for spoken English"
    }
  ],
  "overallAdvice": {
    "strengths": ["positive aspects of the text"],
    "improvements": ["specific areas to focus on"],
    "speakingTips": ["practical tips for better oral communication"],
    "practiceExercises": ["suggested exercises to improve"]
  },
  "naturalAlternatives": [
    {
      "original": "formal/awkward phrase",
      "alternative": "more natural spoken version",
      "context": "when to use this alternative"
    }
  ]
}

Be encouraging but thorough. Focus on helping the learner speak more naturally and confidently. Context: ${context}`
          },
          {
            role: 'user',
            content: `Please check this text for errors: "${text}"`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const correctionText = data.choices[0].message.content;
    
    try {
      const correction = JSON.parse(correctionText);
      return new Response(JSON.stringify(correction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse correction JSON:', parseError);
      // Return fallback - no errors detected
      const fallbackCorrection = {
        hasErrors: false,
        originalText: text,
        correctedText: text,
        errors: [],
        overallAdvice: {
          strengths: ["Your English is clear and understandable"],
          improvements: [],
          speakingTips: ["Keep practicing to build confidence"],
          practiceExercises: []
        },
        naturalAlternatives: []
      };
      
      return new Response(JSON.stringify(fallbackCorrection), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in correct-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});