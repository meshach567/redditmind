'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface Persona {
  id: string;
  username: string;
  bio: string;
  subreddits: string[];
  created_at: string;
}

export default function PersonasSection() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    subreddits: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch personas
  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      const data = await res.json();
      if (data.success) {
        setPersonas(data.personas || []);
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const subreddits = formData.subreddits
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          subreddits,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPersonas([...personas, data.persona]);
        setFormData({ username: '', bio: '', subreddits: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating persona:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPersonas(personas.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reddit Personas</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Persona
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="reddit_username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio (optional)</Label>
              <Input
                id="bio"
                placeholder="Brief background"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="subreddits">Subreddits (comma-separated)</Label>
              <Input
                id="subreddits"
                placeholder="r/technology, r/programming, r/startup"
                value={formData.subreddits}
                onChange={(e) =>
                  setFormData({ ...formData, subreddits: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Persona'}
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

      {/* Personas List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-6 text-center text-gray-500">Loading...</Card>
        ) : personas.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No personas yet. Create one to get started!
          </Card>
        ) : (
          personas.map((persona) => (
            <Card key={persona.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{persona.username}</h3>
                  {persona.bio && (
                    <p className="text-sm text-gray-600">{persona.bio}</p>
                  )}
                  {persona.subreddits && persona.subreddits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {persona.subreddits.map((sub, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Created: {new Date(persona.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(persona.id)}
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
