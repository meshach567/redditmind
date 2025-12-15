'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  subreddit: string;
  title: string;
  body: string;
  scheduled_time: string;
  persona_id: string;
}

interface Comment {
  id: string;
  text: string;
  scheduled_time: string;
  persona_id: string;
}

interface CalendarData {
  id: string;
  week_start: string;
  quality_score: number;
  posts: Post[];
  comments: Comment[];
  created_at: string;
}

export default function CalendarSection() {
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [postsPerWeek, setPostsPerWeek] = useState(3);

  // Fetch calendars
  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const res = await fetch('/api/planning/calendars');
      const data = await res.json();
      if (data.success) {
        setCalendars(data.calendars || []);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate new calendar
  const handleGenerateWeek = async () => {
    setGenerating(true);

    try {
      // Calculate week start (Monday)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);

      const res = await fetch('/api/planning/generate-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: weekStart.toISOString().split('T')[0],
          postsPerWeek,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCalendars([data.calendar, ...calendars]);
        setSelectedCalendar(data.calendar.id);
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
    } finally {
      setGenerating(false);
    }
  };

  const selectedData = calendars.find((c) => c.id === selectedCalendar);

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Calendar</h2>
        <p className="mt-1 text-sm text-gray-600">
          Generate weekly Reddit content calendars
        </p>
      </div>

      {/* Generate Button */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Posts per week</label>
            <input
              type="number"
              min="1"
              max="10"
              value={isNaN(postsPerWeek) ? '' : postsPerWeek}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  setPostsPerWeek(value);
                }
                // If invalid or empty, don't update state (keeps previous valid value)
              }}
              placeholder="Enter posts per week"
              className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <Button
            onClick={handleGenerateWeek}
            disabled={generating}
            className="gap-2"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Generate This Week
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Calendar List & Preview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Generated Calendars</h3>
          {loading ? (
            <Card className="p-6 text-center text-gray-500">Loading...</Card>
          ) : calendars.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No calendars yet. Generate one to get started!
            </Card>
          ) : (
            <div className="space-y-2">
              {calendars.map((cal) => (
                <Card
                  key={cal.id}
                  className={`cursor-pointer p-4 transition ${
                    selectedCalendar === cal.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCalendar(cal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Week of{' '}
                        {new Date(cal.week_start).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cal.posts?.length || 0} posts
                      </p>
                    </div>
                    <div
                      className={`rounded px-2 py-1 text-sm font-semibold ${getQualityColor(
                        cal.quality_score
                      )}`}
                    >
                      {(cal.quality_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h3 className="font-semibold">
            {selectedData ? 'Calendar Preview' : 'Select a Calendar'}
          </h3>
          {selectedData ? (
            <div className="space-y-4">
              <Card className="p-4">
                <p className="text-sm text-gray-600">
                  <strong>Week:</strong>{' '}
                  {new Date(selectedData.week_start).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <strong>Quality Score:</strong>{' '}
                  <span
                    className={getQualityColor(selectedData.quality_score)}
                  >
                    {(selectedData.quality_score * 100).toFixed(1)}%
                  </span>
                </p>
              </Card>

              {/* Posts */}
              <div>
                <h4 className="font-medium">Posts ({selectedData.posts?.length || 0})</h4>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {selectedData.posts?.map((post) => (
                    <Card key={post.id} className="p-3">
                      <p className="text-xs font-semibold text-blue-600">
                        {post.subreddit}
                      </p>
                      <p className="mt-1 font-medium text-sm">{post.title}</p>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {post.body}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(post.scheduled_time).toLocaleString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="font-medium">
                  Comments ({selectedData.comments?.length || 0})
                </h4>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedData.comments?.map((comment) => (
                    <Card key={comment.id} className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {comment.text}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(comment.scheduled_time).toLocaleString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              Select a calendar to preview
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
