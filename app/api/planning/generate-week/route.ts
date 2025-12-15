import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-helpers';
import { requireAuth } from '@/lib/auth-helpers';
import { validateRequestBody, generateCalendarSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

async function handlePost(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { user, supabase } = auth;

  // Validate request body
  const body = await validateRequestBody(request, generateCalendarSchema);
  const { weekStart, postsPerWeek } = body;

  // Fetch user's data
  const [{ data: personas }, { data: keywords }] = await Promise.all([
      supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('keywords')
        .select('*')
        .eq('user_id', user.id),
    ]);

  if (!personas || personas.length < 1) {
    return NextResponse.json(
      { error: 'Need at least 1 persona configured' },
      { status: 400 }
    );
  }

  if (!keywords || keywords.length === 0) {
    return NextResponse.json(
      { error: 'Need at least one keyword configured' },
      { status: 400 }
    );
  }

  // Generate content calendar
  interface PostToGenerate {
      subreddit: string;
      persona_id: string;
      title: string;
      body: string;
      scheduled_time: string;
      keyword_id: string;
    }

    interface CommentToGenerate {
      persona_id: string;
      text: string;
      scheduled_time: string;
    }

    const postsToGenerate: PostToGenerate[] = [];
    const commentsToGenerate: CommentToGenerate[] = [];
    
    // Take first N keywords and create posts
    const selectedKeywords = keywords.slice(0, postsPerWeek);
    
    selectedKeywords.forEach((keyword, index) => {
      // Select a persona for this post
      const personaIndex = index % personas.length;
      const persona = personas[personaIndex];
      
      // Schedule post on different days
      const postDate = new Date(weekStart);
      postDate.setDate(postDate.getDate() + (index % 5)); // Spread across the week
      postDate.setHours(9 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 60), 0);
      
      const postTitle = generatePostTitle(keyword.keyword, keyword.intent_category);
      const postBody = generatePostBody(keyword.keyword, keyword.intent_category);
      
      postsToGenerate.push({
        subreddit: 'r/technology', // Default subreddit
        persona_id: persona.id,
        title: postTitle,
        body: postBody,
        scheduled_time: postDate.toISOString(),
        keyword_id: keyword.id,
      });
      
      // Generate 2-3 comments for each post
      const numComments = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numComments; i++) {
        const commenterIndex = (personaIndex + i + 1) % personas.length;
        const commentTime = new Date(postDate);
        commentTime.setMinutes(commentTime.getMinutes() + 5 + (i * 15) + Math.floor(Math.random() * 10));
        
        commentsToGenerate.push({
          persona_id: personas[commenterIndex].id,
          text: generateComment(keyword.keyword),
          scheduled_time: commentTime.toISOString(),
        });
      }
    });

    // Save calendar
    const { data: calendar, error: calendarError } = await supabase
      .from('content_calendars')
      .insert({
        user_id: user.id,
        week_start: weekStart,
        quality_score: 0.85, // Default quality score
      })
      .select()
      .single();

    if (calendarError || !calendar) {
      throw calendarError;
    }

    // Save posts with calendar_id
    const postsWithCalendar = postsToGenerate.map(p => ({
      ...p,
      calendar_id: calendar.id,
    }));
    
    const { data: savedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(postsWithCalendar)
      .select();

    if (postsError) throw postsError;

    // Save comments with post_id mapping
    const commentsWithPostId = commentsToGenerate.map((c, idx) => ({
      ...c,
      post_id: savedPosts?.[idx % (savedPosts?.length || 1)]?.id,
    }));

    const { error: commentsError } = await supabase
      .from('comments')
      .insert(commentsWithPostId);

    if (commentsError) throw commentsError;

    // Fetch complete calendar
    const { data: completeCalendar, error: fetchError } = await supabase
      .from('content_calendars')
      .select(`
        *,
        posts(
          *
        ),
        comments:posts(comments(*))
      `)
      .eq('id', calendar.id)
      .single();

    if (fetchError) throw fetchError;

    // Transform response
    const response = {
      id: completeCalendar.id,
      week_start: completeCalendar.week_start,
      quality_score: completeCalendar.quality_score,
      posts: savedPosts || [],
      comments: commentsWithPostId,
      created_at: completeCalendar.created_at,
    };

    return NextResponse.json({
      success: true,
      calendar: response,
    });
  } catch (error) {
    logger.error('Error generating calendar', error as Error, {
      userId: user.id,
      weekStart,
      postsPerWeek,
    });
    throw error; // Let api-helpers handle the response
  }
}

export const POST = createApiHandler(handlePost, {
  rateLimit: 'strict', // Expensive operation, use strict rate limiting
  cors: true,
});

/**
 * Generate realistic post title based on keyword and intent
 */
function generatePostTitle(keyword: string, intent: string): string {
  const templates: { [key: string]: string[] } = {
    comparison: [
      `Has anyone compared ${keyword}?`,
      `Best alternatives to ${keyword}?`,
      `${keyword} vs traditional approach?`,
    ],
    recommendation: [
      `What's the best ${keyword}?`,
      `Recommendations for ${keyword}?`,
      `Anyone used ${keyword}?`,
    ],
    'how-to': [
      `How to get started with ${keyword}`,
      `Tips for using ${keyword}`,
      `Guide to ${keyword}`,
    ],
    'problem-driven': [
      `Issues with ${keyword}?`,
      `Anyone else struggling with ${keyword}?`,
      `Help with ${keyword}`,
    ],
    general: [
      `Thoughts on ${keyword}?`,
      `Discussing ${keyword}`,
      `${keyword} - what do you think?`,
    ],
  };

  const templates_array = templates[intent] || templates.general;
  return templates_array[Math.floor(Math.random() * templates_array.length)];
}

/**
 * Generate realistic post body
 */
function generatePostBody(keyword: string, intent: string): string {
  const bodies: { [key: string]: string[] } = {
    comparison: [
      `I've been looking into ${keyword} lately. Has anyone here compared different options? I'd love to hear your thoughts.`,
      `Trying to decide on ${keyword}. What are your experiences compared to other solutions?`,
    ],
    recommendation: [
      `Looking for recommendations on ${keyword}. What do you all suggest?`,
      `Anyone have good suggestions for ${keyword}? Would appreciate your input.`,
    ],
    'how-to': [
      `I'm trying to get better at ${keyword}. Any tips or resources you'd recommend?`,
      `Looking for guidance on ${keyword}. What's your approach?`,
    ],
    'problem-driven': [
      `I've been facing challenges with ${keyword}. Anyone else experiencing this?`,
      `Struggling with ${keyword} - any solutions you've found?`,
    ],
    general: [
      `Thoughts on ${keyword}? Interested in hearing the community's perspective.`,
      `Let's discuss ${keyword}. What's your take on it?`,
    ],
  };

  const bodies_array = bodies[intent] || bodies.general;
  return bodies_array[Math.floor(Math.random() * bodies_array.length)];
}

/**
 * Generate realistic comment
 */
function generateComment(keyword: string): string {
  const comments = [
    `I've had similar thoughts about ${keyword}. Great question!`,
    `This is something I've been curious about too. Good discussion.`,
    `Interesting perspective on ${keyword}. Worth exploring more.`,
    `I agree, ${keyword} is definitely worth considering.`,
    `Thanks for bringing up ${keyword}. Helpful to see others' views.`,
    `I've found that ${keyword} can vary a lot depending on your use case.`,
  ];

  return comments[Math.floor(Math.random() * comments.length)];
}
