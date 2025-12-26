import { Plus, FileText, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (title: string) => void;
  onDeleteNote: (id: string) => void;
}

export const Sidebar = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      onCreateNote(newNoteTitle.trim());
      setNewNoteTitle('');
      setIsDialogOpen(false);
    }
  };

  return (
    <aside className="w-[280px] h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">G</span>
          </div>
          <h1 className="font-semibold text-foreground">GraphChit</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedNoteId === note.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
              }`}
              onClick={() => onSelectNote(note.id)}
            >
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 truncate text-sm">{note.title}</span>
              <span className="text-xs text-muted-foreground">
                {note.backlinks.length + note.forward_links.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Create Note Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
                className="bg-input border-border"
                autoFocus
              />
              <Button
                onClick={handleCreateNote}
                className="w-full bg-primary text-primary-foreground"
                disabled={!newNoteTitle.trim()}
              >
                Create Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
};
