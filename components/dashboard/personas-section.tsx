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
    <section className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 md:p-6 shadow-sm shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Reddit personas</h2>
          <p className="mt-1 text-sm text-slate-400">
            Model the accounts you control so the planner can assign posts and comments realistically.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Hide form' : 'Add persona'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-slate-800 bg-slate-900/70 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-slate-100">
                Username
              </Label>
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
              <Label htmlFor="bio" className="text-slate-100">
                Bio (optional)
              </Label>
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
              <Label htmlFor="subreddits" className="text-slate-100">
                Subreddits (comma-separated)
              </Label>
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
      <div className="grid gap-3">
        {loading ? (
          <Card className="border-slate-800 bg-slate-900/70 p-6 text-center text-slate-400">
            Loading personas...
          </Card>
        ) : personas.length === 0 ? (
          <Card className="border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
            No personas yet. Create one to get started!
          </Card>
        ) : (
          personas.map((persona) => (
            <Card key={persona.id} className="border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-50 md:text-base">
                    {persona.username}
                  </h3>
                  {persona.bio && (
                    <p className="mt-1 text-sm text-slate-300">{persona.bio}</p>
                  )}
                  {persona.subreddits && persona.subreddits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {persona.subreddits.map((sub, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-full bg-sky-900/60 px-2 py-0.5 text-xs text-sky-200 ring-1 ring-sky-600/40"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
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
    </section>
  );
}
