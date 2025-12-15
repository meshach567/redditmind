'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  search_intent: string;
  intent_category: string;
  created_at: string;
}

const INTENT_CATEGORIES = [
  'comparison',
  'recommendation',
  'how-to',
  'problem-driven',
  'general',
];

export default function KeywordsSection() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    search_intent: '',
    intent_category: 'general',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch keywords
  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords');
      const data = await res.json();
      if (data.success) {
        setKeywords(data.keywords || []);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setKeywords([...keywords, data.keyword]);
        setFormData({
          keyword: '',
          search_intent: '',
          intent_category: 'general',
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating keyword:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKeywords(keywords.filter((k) => k.id !== id));
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      comparison: 'bg-purple-100 text-purple-700',
      recommendation: 'bg-green-100 text-green-700',
      'how-to': 'bg-blue-100 text-blue-700',
      'problem-driven': 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Keywords & Search Intent</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Keyword
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., best presentation software"
                value={formData.keyword}
                onChange={(e) =>
                  setFormData({ ...formData, keyword: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="search_intent">Search Intent (optional)</Label>
              <Input
                id="search_intent"
                placeholder="e.g., looking for presentation tools"
                value={formData.search_intent}
                onChange={(e) =>
                  setFormData({ ...formData, search_intent: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="intent_category">Intent Category</Label>
              <select
                id="intent_category"
                value={formData.intent_category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intent_category: e.target.value,
                  })
                }
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                title="Select an intent category"
              >
                {INTENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                • <strong>Comparison</strong>: X vs Y, alternatives
                <br />• <strong>Recommendation</strong>: best tool for...
                <br />• <strong>How-to</strong>: tutorials, workflows
                <br />• <strong>Problem-driven</strong>: solving issues
                <br />• <strong>General</strong>: other topics
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Keyword'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Keywords List */}
      <div className="grid gap-3">
        {loading ? (
          <Card className="p-6 text-center text-gray-500">Loading...</Card>
        ) : keywords.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No keywords yet. Add some to start generating content!
          </Card>
        ) : (
          keywords.map((kw) => (
            <Card key={kw.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{kw.keyword}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(
                        kw.intent_category
                      )}`}
                    >
                      {kw.intent_category}
                    </span>
                  </div>
                  {kw.search_intent && (
                    <p className="mt-1 text-sm text-gray-600">
                      Intent: {kw.search_intent}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Added: {new Date(kw.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(kw.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
