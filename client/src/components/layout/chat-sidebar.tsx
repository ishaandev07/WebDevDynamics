import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Bot, Send, Search, Wrench, BookOpen } from "lucide-react";

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatSidebar() {
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat', projectId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message: content,
        projectId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
      setMessage('');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    sendMessageMutation.mutate(action);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Bot className="text-white text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Assistant</h3>
            <p className="text-xs text-slate-500">Online</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-xs" />
              </div>
              <div className="bg-slate-100 rounded-lg px-3 py-2 max-w-xs">
                <p className="text-sm text-slate-700">
                  Hi! I'm here to help you with your deployments. I can analyze your code, 
                  suggest fixes, and guide you through the deployment process.
                </p>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-xs" />
                </div>
              )}
              <div
                className={`rounded-lg px-3 py-2 max-w-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 bg-slate-300 rounded-full flex-shrink-0"></div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white text-xs" />
              </div>
              <div className="bg-slate-100 rounded-lg px-3 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="border-t border-slate-200 pt-4 px-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Quick Actions</p>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100 px-2 py-1 rounded h-auto"
              onClick={() => handleQuickAction("Analyze my latest upload")}
            >
              <Search className="mr-2 h-3 w-3 text-slate-400" />
              Analyze my latest upload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100 px-2 py-1 rounded h-auto"
              onClick={() => handleQuickAction("Generate config files for my project")}
            >
              <Wrench className="mr-2 h-3 w-3 text-slate-400" />
              Generate config files
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-slate-700 hover:bg-slate-100 px-2 py-1 rounded h-auto"
              onClick={() => handleQuickAction("Show me deployment guide")}
            >
              <BookOpen className="mr-2 h-3 w-3 text-slate-400" />
              View deployment guide
            </Button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask me anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 text-sm"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
