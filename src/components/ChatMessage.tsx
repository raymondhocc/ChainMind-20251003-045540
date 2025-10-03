import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Message } from '../../worker/types';
interface ChatMessageProps {
  message: Message;
}
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex items-start gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-4 text-base',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-muted text-foreground rounded-bl-lg'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>Using tool...</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.toolCalls.map((toolCall) => (
                <Badge key={toolCall.id} variant="secondary" className="font-mono text-xs">
                  {toolCall.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <User className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}