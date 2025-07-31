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
    const { userMessages, topic, userName } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing conversation with OpenAI...');

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
            content: `You are an encouraging English teacher analyzing a student's conversation practice. Always be positive and supportive. Provide detailed feedback in JSON format with these exact fields:
            {
              "grammarErrors": [{"error": "mistake", "correction": "fix", "explanation": "why"}],
              "vocabularyImprovements": [{"word": "basic word", "betterAlternatives": ["synonym1", "synonym2"], "context": "usage context"}],
              "pronunciationTips": ["Tip 1", "Tip 2"],
              "overallFeedback": "Positive overall assessment",
              "strengths": ["Strength 1", "Strength 2"],
              "areasToImprove": ["Area 1", "Area 2"],
              "nextSteps": ["Step 1", "Step 2"],
              "scoreBreakdown": {
                "grammar": 8,
                "vocabulary": 7,
                "fluency": 8,
                "pronunciation": 7,
                "overall": 8
              }
            }`
          },
          {
            role: 'user',
            content: `Please analyze this English conversation practice by ${userName} on the topic "${topic}". Student messages: ${userMessages.join('. ')}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(analysisText);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Return fallback analysis
      const fallbackAnalysis = {
        grammarErrors: [],
        vocabularyImprovements: [],
        pronunciationTips: ["Keep practicing to improve pronunciation"],
        overallFeedback: "Great job participating in the conversation!",
        strengths: ["Engaged actively in the conversation"],
        areasToImprove: ["Keep practicing regularly"],
        nextSteps: ["Try more conversations on different topics"],
        scoreBreakdown: {
          grammar: 7,
          vocabulary: 7,
          fluency: 7,
          pronunciation: 7,
          overall: 7
        }
      };
      
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in analyze-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});