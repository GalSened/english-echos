import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { correction, userName } = await req.json();

    if (!correction || !userName) {
      throw new Error('Missing correction data or userName');
    }

    console.log('Generating fun correction for:', userName);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a friendly, encouraging English teacher with a light sense of humor. Your job is to correct errors in a FUN and CONVERSATIONAL way through SPEECH, not text displays.

CRITICAL RULES:
- Keep corrections VERY SHORT (max 15 words)
- Be LIGHT and FUNNY, not academic
- SPEAK the correction naturally like a friend would
- Use the student's name (${userName}) 
- Make it feel like casual conversation, not a lesson
- Never mention "error types" or be formal
- Use phrases like "Oh!" "Actually..." "Try saying..." "How about..."
- Add encouraging words like "Nice!", "Almost!", "Great try!"
- Voice ID to use: 9BWtsMINqrJLrRacOk9x (Aria - friendly female voice)

Examples of good corrections:
- "Oh ${userName}, try 'I went there' instead of 'I go there'. Sounds more natural!"
- "Nice try! How about 'bigger' instead of 'more big'? Much smoother!"
- "Actually, we say 'I have been' not 'I am been'. You're so close!"

Make it feel like a helpful friend, not a teacher giving a lesson.`
          },
          {
            role: 'user',
            content: `Please give a fun, short spoken correction for this:
Original: "${correction.originalText}"
Corrected: "${correction.correctedText}"
Errors: ${correction.errors.map(e => `${e.original} → ${e.corrected} (${e.type})`).join(', ')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const funCorrection = data.choices[0]?.message?.content?.trim();

    if (!funCorrection) {
      throw new Error('No response generated from OpenAI');
    }

    console.log('Generated fun correction:', funCorrection);

    return new Response(
      JSON.stringify({ response: funCorrection }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-fun-correction function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: `Hey ${req.body?.userName || 'there'}! Quick tip - sounds great, just keep practicing!`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});