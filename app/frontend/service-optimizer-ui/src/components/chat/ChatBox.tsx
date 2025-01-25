import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, ChatBoxProps } from './types';
import { findBestResponse } from './predefinedResponses';

export function ChatBox({ className = '' }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    type: 'ai',
    content: 'Welcome! I can help you analyze service performance and provide optimization recommendations. Feel free to ask questions about any service.',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: findBestResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className={`fixed bottom-4 right-4 ${isExpanded ? 'w-96' : 'w-auto'} shadow-xl transition-all duration-200 z-[9999] ${className}`}>
      <div className="p-4 border-b flex items-center justify-between bg-[#45B6B0] text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          <div className="p-2 bg-gray-50 text-xs text-gray-500 border-b">
            This is a demo feature. Responses are simulated for illustrative purposes.
          </div>

          <ScrollArea className="h-96 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                  message.type === 'user'
                    ? 'bg-[#45B6B0] text-white'
                    : 'bg-gray-100 text-gray-800'
                } hover:shadow-md transition-shadow duration-200`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg flex items-center gap-2">
                <span>AI is typing</span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ...
                </motion.span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

          <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about service optimization..."
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-[#45B6B0] hover:bg-[#3a9a95]">
            <Send className="w-4 h-4" />
          </Button>
        </div>
          </div>
        </>
      )}
    </Card>
  );
}
