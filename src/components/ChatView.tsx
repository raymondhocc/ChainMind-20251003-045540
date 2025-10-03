import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Bot, Loader, SendHorizonal, Sparkles } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
export function ChatView() {
  const { messages, streamingMessage, isProcessing, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      }
    }
  };
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('auto');
    }
  }, [messages, streamingMessage, isAtBottom]);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const bottomThreshold = 50;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < bottomThreshold);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <div className="flex flex-col h-full bg-muted/50">
      <div className="flex-1 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef} onScroll={handleScroll}>
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <AnimatePresence>
              {messages.length === 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full pt-24 text-center"
                >
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground">ChainMind AI</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Your intelligent assistant for supply chain master data management.
                    Start by asking to create a material, customer, or pricing record.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {streamingMessage && (
              <div className="flex items-start gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-4 text-base bg-muted text-foreground rounded-bl-lg">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
                    {streamingMessage}
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        {!isAtBottom && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 z-10 rounded-full h-10 w-10 shadow-lg"
            onClick={() => scrollToBottom()}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="p-4 sm:p-6 lg:p-8 border-t bg-background">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Create a new material for a 12V DC Motor..."
            className="w-full pr-24 py-3 pl-4 text-base resize-none min-h-[52px] max-h-48 rounded-2xl"
            rows={1}
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button type="submit" size="lg" disabled={!input.trim() || isProcessing} className="rounded-xl">
              {isProcessing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <SendHorizonal className="w-5 h-5 sm:ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}