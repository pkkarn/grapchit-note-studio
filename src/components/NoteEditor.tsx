import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Eye, Save, Link2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface NoteEditorProps {
  note: Note;
  allNotes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onClose: () => void;
  onNavigateToNote: (id: string) => void;
}

export const NoteEditor = ({
  note,
  allNotes,
  onUpdate,
  onClose,
  onNavigateToNote,
}: NoteEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  }, [note.id]);

  const handleSave = () => {
    onUpdate(note.id, { title, content });
    setIsEditing(false);
  };

  const backlinkedNotes = allNotes.filter(n => note.backlinks.includes(n.id));
  const linkedNotes = allNotes.filter(n => note.forward_links.includes(n.id));

  // Custom renderer for [[links]]
  const renderContent = (text: string) => {
    return text.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
      return `[${linkText}](#link-${linkText})`;
    });
  };

  return (
    <div className="h-full flex flex-col bg-card fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold bg-input border-border max-w-md"
            />
          ) : (
            <h2 className="text-xl font-semibold text-foreground">{note.title}</h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="bg-secondary text-secondary-foreground"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Editor/Preview */}
        <div className="flex-1 overflow-auto p-6">
          {isEditing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] bg-input border-border font-mono text-sm resize-none"
              placeholder="Write your note in Markdown..."
            />
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => {
                    if (href?.startsWith('#link-')) {
                      const linkTitle = href.replace('#link-', '');
                      const targetNote = allNotes.find(
                        n => n.title.toLowerCase() === linkTitle.toLowerCase()
                      );
                      if (targetNote) {
                        return (
                          <button
                            onClick={() => onNavigateToNote(targetNote.id)}
                            className="text-primary hover:underline font-medium"
                          >
                            {children}
                          </button>
                        );
                      }
                    }
                    return (
                      <a href={href} className="text-primary hover:underline">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {renderContent(content)}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Backlinks Panel */}
        <aside className="w-64 border-l border-border bg-muted/30 p-4 overflow-auto">
          <div className="space-y-6">
            {/* Forward Links */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Links ({linkedNotes.length})
              </h3>
              <div className="space-y-2">
                {linkedNotes.length > 0 ? (
                  linkedNotes.map(linkedNote => (
                    <button
                      key={linkedNote.id}
                      onClick={() => onNavigateToNote(linkedNote.id)}
                      className="w-full text-left p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className="text-sm text-foreground">{linkedNote.title}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No outgoing links</p>
                )}
              </div>
            </div>

            {/* Backlinks */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Backlinks ({backlinkedNotes.length})
              </h3>
              <div className="space-y-2">
                {backlinkedNotes.length > 0 ? (
                  backlinkedNotes.map(backlinkedNote => (
                    <button
                      key={backlinkedNote.id}
                      onClick={() => onNavigateToNote(backlinkedNote.id)}
                      className="w-full text-left p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                    >
                      <span className="text-sm text-foreground">{backlinkedNote.title}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No backlinks yet</p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Created: {new Date(note.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated: {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
