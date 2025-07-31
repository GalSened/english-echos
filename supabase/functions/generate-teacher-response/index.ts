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
    const { userMessage, conversationHistory, topic, userName } = await req.json();

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
            content: `You are an experienced, encouraging English teacher having a conversation practice session with a student named ${userName} on the topic "${topic}". 

Your role:
- Keep the conversation flowing naturally and help the student practice speaking
- Ask thoughtful follow-up questions based on what they say
- Show genuine interest in their responses
- Encourage them to elaborate and express their thoughts
- Be supportive and create a comfortable learning environment
- Occasionally introduce new vocabulary related to the topic
- Keep responses conversational and not too long (1-3 sentences max)
- Respond directly to what they just said, don't ignore their input

Current conversation context:
${contextString}

Student just said: "${userMessage}"

Respond naturally as their teacher, building on what they shared.`
          },
          {
            role: 'user',
            content: `The student just said: "${userMessage}". Please respond as their English teacher to continue the conversation naturally.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
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
    
    // Fallback response
    const fallbackResponses = [
      "That's interesting! Can you tell me more about that?",
      "I'd love to hear more about your thoughts on this.",
      "That's a great point! What else can you share?",
      "How do you feel about what you just mentioned?",
      "Can you explain that a bit more?"
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return new Response(JSON.stringify({ response: fallbackResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});