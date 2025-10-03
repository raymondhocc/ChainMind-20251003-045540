import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
export function MobileHeader() {
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  return (
    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <h1 className="text-xl font-bold font-display text-foreground">ChainMind AI</h1>
    </header>
  );
}