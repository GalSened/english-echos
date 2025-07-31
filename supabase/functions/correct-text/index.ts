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
            content: `You are a gentle English teacher helping students improve their English. Analyze the text for errors and provide corrections in this exact JSON format:
            {
              "hasErrors": true/false,
              "originalText": "original text",
              "correctedText": "corrected text if errors exist, otherwise same as original",
              "errors": [
                {
                  "type": "grammar/spelling/vocabulary/pronunciation",
                  "original": "incorrect part",
                  "corrected": "corrected part", 
                  "explanation": "gentle explanation"
                }
              ]
            }
            Be encouraging and only point out significant errors. Context: ${context}`
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
        errors: []
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