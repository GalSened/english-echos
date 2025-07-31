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
    const { userMessage, conversationHistory, topic, userName, userLevel = "intermediate" } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating teacher response with OpenAI...');

    // Build conversation context
    const recentHistory = conversationHistory.slice(-10); // Last 10 messages for context
    const contextString = recentHistory.map((msg: any) => 
      `${msg.isTeacher ? 'Teacher' : userName}: ${msg.text}`
    ).join('\n');

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
            content: `You are an English conversation teacher with a ${userLevel} level student named ${userName} practicing "${topic}". 

CRITICAL: Your role is to facilitate conversation, NOT dominate it. The student should be the main speaker.

RESPONSE RULES - FOLLOW STRICTLY:
- Keep responses SHORT (1-2 sentences max, preferably just 1)
- Ask brief questions to encourage student speech
- Use simple follow-ups like "Tell me more" or "What else?"
- Don't give long explanations unless specifically asked
- Focus on getting the STUDENT to talk, not showcasing your knowledge

LEVEL-SPECIFIC APPROACH:

BEGINNER: Use simple words, short questions. Examples: "What do you think?" "Tell me more." "And then?"

INTERMEDIATE: Ask open questions but keep them brief. Examples: "How do you feel about that?" "What happened next?" "Why do you think so?"

ADVANCED: Ask thought-provoking but concise questions. Examples: "What's your perspective on this?" "How would you approach it differently?" "What surprised you most?"

REMEMBER: Your goal is to make the STUDENT speak as much as possible. Be encouraging but brief.

Recent conversation:
${contextString}

Student just said: "${userMessage}"

Respond with a SHORT encouraging comment or brief question to keep them talking.`
          },
          {
            role: 'user',
            content: `Student: "${userMessage}". Give a brief, encouraging response (1 sentence) that gets them to continue talking.`
          }
        ],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const teacherResponse = data.choices[0].message.content.trim();
    
    return new Response(JSON.stringify({ response: teacherResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-teacher-response function:', error);
    
    // Fallback response - short and encouraging
    const fallbackResponses = [
      "Tell me more!",
      "What else?",
      "And then?",
      "How do you feel about that?",
      "What do you think?"
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(JSON.stringify({ response: fallbackResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});