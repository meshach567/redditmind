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
    <section className="space-y-6 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 md:p-6 shadow-sm shadow-black/20">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-50">Content calendar</h2>
        <p className="text-sm text-slate-400">
          Generate a weekly Reddit plan with posts, personas, and comment threads.
        </p>
      </div>

      {/* Generate Button */}
      <Card className="border-slate-800 bg-slate-900/70 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100">
              Posts per week
            </label>
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
              className="mt-1 block w-full max-w-xs rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
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
          <h3 className="text-sm font-semibold text-slate-100">Generated calendars</h3>
          {loading ? (
            <Card className="border-slate-800 bg-slate-900/70 p-6 text-center text-slate-400">
              Loading calendars...
            </Card>
          ) : calendars.length === 0 ? (
            <Card className="border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
              No calendars yet. Generate one to get started!
            </Card>
          ) : (
            <div className="space-y-2">
              {calendars.map((cal) => (
                <Card
                  key={cal.id}
                  className={`cursor-pointer border-slate-800 p-4 transition ${
                    selectedCalendar === cal.id
                      ? 'border-sky-500 bg-sky-950/60'
                      : 'bg-slate-900/70 hover:bg-slate-900'
                  }`}
                  onClick={() => setSelectedCalendar(cal.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-50">
                        Week of{' '}
                        {new Date(cal.week_start).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
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
          <h3 className="text-sm font-semibold text-slate-100">
            {selectedData ? 'Calendar preview' : 'Select a calendar'}
          </h3>
          {selectedData ? (
            <div className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-300">
                  <strong>Week:</strong>{' '}
                  {new Date(selectedData.week_start).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-slate-300">
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
                <h4 className="text-sm font-medium text-slate-100">
                  Posts ({selectedData.posts?.length || 0})
                </h4>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {selectedData.posts?.map((post) => (
                    <Card key={post.id} className="border-slate-800 bg-slate-900/70 p-3">
                      <p className="text-xs font-semibold text-sky-300">
                        {post.subreddit}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-50">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                        {post.body}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(post.scheduled_time).toLocaleString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium text-slate-100">
                  Comments ({selectedData.comments?.length || 0})
                </h4>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedData.comments?.map((comment) => (
                    <Card
                      key={comment.id}
                      className="border-slate-800 bg-slate-900/70 p-2"
                    >
                      <p className="text-xs text-slate-200 line-clamp-2">
                        {comment.text}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(comment.scheduled_time).toLocaleString()}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
              Select a calendar to preview
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
