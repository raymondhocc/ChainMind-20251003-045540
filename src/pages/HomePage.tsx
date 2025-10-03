import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { useChatStore } from '@/stores/chatStore';
import { Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MobileHeader } from '@/components/MobileHeader';
export function HomePage() {
  const { initialize, isLoadingHistory, activeSessionId, isSidebarOpen, setSidebarOpen } = useChatStore();
  const isMobile = useIsMobile();
  useEffect(() => {
    initialize();
  }, [initialize]);
  if (isLoadingHistory && !activeSessionId) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/50">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
        <MobileHeader />
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <main className="flex-1 flex flex-col min-w-0">
          <ChatView />
        </main>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden">
      <div className="w-72 lg:w-80 flex-shrink-0 border-r">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-w-0">
        <ChatView />
      </main>
    </div>
  );
}