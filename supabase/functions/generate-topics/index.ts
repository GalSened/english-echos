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
    const { userName, difficulty = "intermediate" } = await req.json();

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating conversation topics with OpenAI...');

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
            content: `You are an expert English teacher creating engaging conversation topics for students. Generate 8 diverse, interesting conversation topics that will help students practice their English speaking skills.

Requirements:
- Mix of everyday topics, current events, hypothetical scenarios, and creative discussions
- Topics should be engaging and encourage students to express opinions and experiences
- Include a variety of difficulty levels and subject areas
- Each topic should have a compelling title and helpful description
- Make topics relevant to modern life and student interests
- Ensure topics promote meaningful conversation practice

Student level: ${difficulty}
Student name: ${userName}

Return exactly this JSON format:
{
  "topics": [
    {
      "title": "Topic Title",
      "description": "Engaging description that explains what to discuss and gives conversation starters"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Generate 8 fresh, engaging conversation topics for ${userName} to practice English. Make them diverse and interesting!`
          }
        ],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const topicsText = data.choices[0].message.content;
    
    try {
      const parsedTopics = JSON.parse(topicsText);
      return new Response(JSON.stringify(parsedTopics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse topics JSON:', parseError);
      
      // Fallback topics
      const fallbackTopics = {
        topics: [
          {
            title: "Travel Adventures",
            description: "Share your dream destinations and travel experiences. What's the most interesting place you've visited or would like to visit?"
          },
          {
            title: "Technology in Daily Life",
            description: "Discuss how technology has changed our lives. What apps or gadgets do you find most useful?"
          },
          {
            title: "Food and Culture",
            description: "Talk about your favorite cuisines and cooking experiences. What dish represents your culture best?"
          },
          {
            title: "Future Predictions",
            description: "Share your thoughts about what life will be like in 20 years. What changes do you expect to see?"
          },
          {
            title: "Learning and Education",
            description: "Discuss your learning experiences and goals. What's the most interesting thing you've learned recently?"
          },
          {
            title: "Environment and Nature",
            description: "Talk about environmental issues and solutions. How do you try to help protect the environment?"
          },
          {
            title: "Entertainment and Hobbies",
            description: "Share what you do for fun and relaxation. What hobby would you like to try?"
          },
          {
            title: "Personal Growth",
            description: "Discuss your goals and aspirations. What achievement are you most proud of?"
          }
        ]
      };
      
      return new Response(JSON.stringify(fallbackTopics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-topics function:', error);
    
    // Return fallback topics on error
    const fallbackTopics = {
      topics: [
        {
          title: "Daily Routines",
          description: "Talk about your typical day and daily habits. What's your favorite part of the day?"
        },
        {
          title: "Movies and Entertainment",
          description: "Discuss your favorite films, shows, and entertainment. What genre do you enjoy most?"
        },
        {
          title: "Sports and Activities",
          description: "Share your experiences with sports and physical activities. What keeps you active?"
        },
        {
          title: "Career and Work",
          description: "Talk about your career goals and work experiences. What's your dream job?"
        }
      ]
    };
    
    return new Response(JSON.stringify(fallbackTopics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});