-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  backlinks TEXT[] DEFAULT '{}',
  forward_links TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth for now)
CREATE POLICY "Anyone can read notes" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update notes" 
ON public.notes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete notes" 
ON public.notes 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notes
INSERT INTO public.notes (id, title, content, backlinks, forward_links) VALUES 
('00000000-0000-0000-0000-000000000001', 'Welcome', '# Welcome to Graph Notes

This is your personal knowledge graph. Here''s how to get started:

## Creating Notes
- Click the **+ New Note** button in the sidebar
- Each note becomes a node in the graph

## Linking Notes
- Use `[[Note Title]]` syntax to create links
- Example: [[Getting Started]] or [[Ideas]]

## Navigation
- Click on any node in the graph to open that note
- Use the sidebar to browse all notes

Happy note-taking! 🚀', ARRAY['00000000-0000-0000-0000-000000000002'], ARRAY['00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003']),
('00000000-0000-0000-0000-000000000002', 'Getting Started', '# Getting Started

Welcome to your knowledge graph! This note is linked from [[Welcome]].

## Features
- **Graph Visualization**: See all your notes as an interactive network
- **Backlinks**: Automatically track which notes reference each other
- **Markdown Support**: Full markdown editing with live preview

## Tips
1. Start with a few core concepts
2. Link related ideas together
3. Watch your knowledge graph grow!

Check out [[Ideas]] for inspiration.', ARRAY['00000000-0000-0000-0000-000000000001'], ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003']),
('00000000-0000-0000-0000-000000000003', 'Ideas', '# Ideas

A collection of thoughts and concepts.

## Backlinked from
- [[Welcome]]
- [[Getting Started]]

## Random Thoughts
- Knowledge graphs help visualize connections
- Linking notes creates emergent structures
- The more you connect, the more you discover', ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'], ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']);

-- Enable realtime for notes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;