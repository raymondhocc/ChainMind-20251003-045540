import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, MessageSquareText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiKeyDisclaimer } from './ApiKeyDisclaimer';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ThemeToggle } from './ThemeToggle';
export function Sidebar() {
  const { sessions, activeSessionId, newSession, switchSession, deleteSession, setSidebarOpen } = useChatStore();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };
  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };
  const handleSwitchSession = (sessionId: string) => {
    switchSession(sessionId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  return (
    <>
      <div className="flex h-full flex-col bg-muted p-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-xl font-bold font-display text-foreground">ChainMind AI</h1>
          <Button variant="ghost" size="icon" onClick={newSession} className="text-muted-foreground hover:text-primary">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 -mx-4">
          <div className="p-4 space-y-1">
            {sessions.map((session) => (
              <div key={session.id} className="group relative">
                <Button
                  variant={activeSessionId === session.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-auto py-2 px-3 text-left',
                    activeSessionId === session.id && 'bg-primary/10 text-primary hover:bg-primary/10'
                  )}
                  onClick={() => handleSwitchSession(session.id)}
                >
                  <MessageSquareText className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{session.title}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  onClick={(e) => handleDeleteClick(e, session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-4 border-t flex items-center justify-between">
          <ApiKeyDisclaimer />
          <ThemeToggle className="relative" />
        </div>
      </div>
      <ConfirmationDialog
        isOpen={!!sessionToDelete}
        onOpenChange={(isOpen) => !isOpen && setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Session?"
        description="This action cannot be undone. This will permanently delete this chat session."
        confirmText="Delete"
      />
    </>
  );
}