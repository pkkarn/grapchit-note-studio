import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNotes } from '@/hooks/useNotes';
import { Sidebar } from '@/components/Sidebar';
import { GraphView } from '@/components/GraphView';
import { NoteEditor } from '@/components/NoteEditor';

const Index = () => {
  const {
    notes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    graphData,
    isLoading,
  } = useNotes();

  const [showEditor, setShowEditor] = useState(false);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNoteId(nodeId);
    setShowEditor(true);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>GraphChit - Visualize Your Notes</title>
        <meta name="description" content="Visualize your notes and link them in graphical format with GraphChit" />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {showEditor && selectedNote ? (
            <NoteEditor
              note={selectedNote}
              allNotes={notes}
              onUpdate={updateNote}
              onClose={handleCloseEditor}
              onNavigateToNote={handleSelectNote}
            />
          ) : (
            <div className="flex-1 relative">
              <GraphView
                data={graphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNoteId}
              />
              
              {/* Empty State Overlay */}
              {notes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center max-w-md p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Start Your Knowledge Graph
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Create your first note to begin building connections between your ideas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Index;
