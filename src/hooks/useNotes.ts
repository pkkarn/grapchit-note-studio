import { useState, useEffect, useCallback } from 'react';
import { Note, GraphData } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Extract links from content using [[Title]] syntax
  const extractLinks = useCallback((content: string): string[] => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = content.matchAll(linkRegex);
    const links: string[] = [];
    for (const match of matches) {
      links.push(match[1]);
    }
    return links;
  }, []);

  // Calculate backlinks and forward_links for all notes
  const calculateLinks = useCallback((allNotes: Note[]): Note[] => {
    return allNotes.map(note => {
      const linkedTitles = extractLinks(note.content);
      const forward_links = linkedTitles
        .map(title => allNotes.find(n => n.title.toLowerCase() === title.toLowerCase())?.id)
        .filter((id): id is string => !!id);

      const backlinks = allNotes
        .filter(n => {
          const links = extractLinks(n.content);
          return links.some(l => l.toLowerCase() === note.title.toLowerCase());
        })
        .map(n => n.id);

      return { ...note, forward_links, backlinks };
    });
  }, [extractLinks]);

  // Load notes from database
  const fetchNotes = useCallback(async () => {
    if (!userId) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error);
      setIsLoading(false);
      return;
    }

    setNotes(data || []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotes]);

  const createNote = useCallback(async (title: string) => {
    if (!userId) return null;

    const newNote = {
      title,
      content: `# ${title}\n\nStart writing here...`,
      backlinks: [],
      forward_links: [],
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    if (data) {
      setSelectedNoteId(data.id);
    }
    return data;
  }, [userId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    // First update the note content
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating note:', updateError);
      return;
    }

    // Then recalculate and update all links
    const { data: allNotes } = await supabase.from('notes').select('*');
    if (!allNotes) return;

    const updatedNotes = calculateLinks(allNotes);
    
    // Batch update all notes with new link data
    for (const note of updatedNotes) {
      await supabase
        .from('notes')
        .update({
          backlinks: note.backlinks,
          forward_links: note.forward_links,
        })
        .eq('id', note.id);
    }
  }, [calculateLinks]);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return;
    }

    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }

    // Recalculate links after deletion
    const { data: allNotes } = await supabase.from('notes').select('*');
    if (!allNotes) return;

    const updatedNotes = calculateLinks(allNotes);
    for (const note of updatedNotes) {
      await supabase
        .from('notes')
        .update({
          backlinks: note.backlinks,
          forward_links: note.forward_links,
        })
        .eq('id', note.id);
    }
  }, [selectedNoteId, calculateLinks]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  // Generate graph data
  const graphData: GraphData = {
    nodes: notes.map(note => ({
      id: note.id,
      name: note.title,
      val: 5 + (note.backlinks.length + note.forward_links.length) * 2,
      color: note.backlinks.length > 2 ? 'hsl(280, 70%, 60%)' : 'hsl(175, 80%, 50%)',
    })),
    links: notes.flatMap(note =>
      note.forward_links.map(targetId => ({
        source: note.id,
        target: targetId,
      }))
    ),
  };

  return {
    notes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    graphData,
    isLoading,
  };
};
