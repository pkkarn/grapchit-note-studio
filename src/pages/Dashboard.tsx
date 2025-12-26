import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { GraphView } from '@/components/GraphView';
import { NoteEditor } from '@/components/NoteEditor';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - GraphChit</title>
        <meta name="description" content="Visualize your notes and link them in graphical format" />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <div className="flex flex-col h-full">
          <Sidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={createNote}
            onDeleteNote={deleteNote}
          />
          <div className="w-[280px] p-4 border-r border-sidebar-border bg-sidebar">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

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

export default Dashboard;
