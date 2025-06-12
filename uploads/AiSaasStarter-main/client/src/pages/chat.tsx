import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageFeedback } from "@/components/message-feedback";
import { RatingPopup } from "@/components/rating-popup";
import { useChat } from "@/hooks/use-chat";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Bot, User, ChevronDown, Database, Brain, Target, MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  category?: string;
  results?: Array<{
    input: string;
    output: string;
    similarity: number;
    source: string;
  }>;
}

const suggestedCommands = [
  {
    icon: User,
    text: "How do I reset my password?",
    category: "Account"
  },
  {
    icon: MessageSquare,
    text: "I need help with billing issues",
    category: "Billing"
  },
  {
    icon: Database,
    text: "How to export my data?",
    category: "Data"
  },
  {
    icon: Brain,
    text: "What features are available?",
    category: "Features"
  },
  {
    icon: Target,
    text: "I'm having technical problems",
    category: "Support"
  },
  {
    icon: Bot,
    text: "Show me customer management tips",
    category: "Tips"
  }
];

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today? You can ask me anything or use one of the suggested commands below.",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [sessionId, setSessionId] = useState<string>();
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const { toast } = useToast();


  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isLoading } = useChat({
    onMessage: (response) => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.reply,
        isUser: false,
        timestamp: new Date(),
        confidence: response.confidence,
        category: response.category,
        results: response.results,
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Increment message count and check if we should show rating popup
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      

      
      // Show rating popup after every 5 interactions (but not on the first few)
      if (newCount >= 3 && newCount % 5 === 0) {
        setTimeout(() => setShowRatingPopup(true), 2000);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");



    try {
      await sendMessage(message, sessionId);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedCommand = (command: string) => {
    setMessage(command);
    setTimeout(() => handleSend(), 100);
  };

  const handleQuickFeedback = async (messageId: string, isPositive: boolean) => {
    if (feedbackGiven.has(messageId)) return;

    try {
      const messageData = messages.find(m => m.id === messageId);
      if (!messageData) return;

      const userMessage = messages.find(m => m.isUser && messages.indexOf(m) === messages.indexOf(messageData) - 1);
      
      await apiRequest("POST", "/api/chat/feedback", {
        sessionId: sessionId || "anonymous",
        messageId,
        userMessage: userMessage?.content || "",
        botResponse: messageData.content,
        feedback: isPositive,
        rating: isPositive ? 5 : 2,
        timestamp: new Date().toISOString()
      });

      setFeedbackGiven(prev => new Set(Array.from(prev).concat(messageId)));
      
      toast({
        title: "Feedback Recorded",
        description: `Thank you for your ${isPositive ? "positive" : "negative"} feedback!`
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };



  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'greeting': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-red-100 text-red-800';
      case 'password_reset': return 'bg-blue-100 text-blue-800';
      case 'general_support': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted">
      <div className="flex items-center justify-between p-4 bg-white border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId.slice(-8)}` : "Starting new session..."}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {messageCount} messages
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.isUser ? "order-2" : "order-1"}`}>
              <Card className={`${msg.isUser ? "bg-primary text-primary-foreground" : "bg-white"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.isUser ? "bg-primary-foreground/20" : "bg-muted"
                    }`}>
                      {msg.isUser ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      
                      {msg.category && (
                        <Badge variant="secondary" className={`text-xs ${getCategoryBadgeColor(msg.category)}`}>
                          {msg.category.replace('_', ' ')}
                        </Badge>
                      )}

                      {msg.confidence && (
                        <div className="text-xs opacity-70">
                          Confidence: {Math.round(msg.confidence * 100)}%
                        </div>
                      )}

                      {msg.results && msg.results.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs">
                              <Database className="w-3 h-3 mr-1" />
                              View {msg.results.length} related results
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="space-y-2">
                              {msg.results.slice(0, 3).map((result, idx) => (
                                <div key={idx} className="text-xs p-2 bg-muted rounded border-l-2 border-primary/20">
                                  <p className="font-medium">{result.input}</p>
                                  <p className="text-muted-foreground mt-1">{result.output}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {result.source}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(result.similarity * 100)}% match
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {!msg.isUser && !feedbackGiven.has(msg.id) && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuickFeedback(msg.id, true)}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuickFeedback(msg.id, false)}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      {feedbackGiven.has(msg.id) && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Thank you for your feedback!
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground mt-1 px-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Commands */}
      {messages.length <= 2 && (
        <div className="p-4 border-t bg-white">
          <p className="text-sm font-medium mb-3">Suggested commands:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {suggestedCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => handleSuggestedCommand(command.text)}
                >
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium">{command.category}</div>
                    <div className="text-xs text-muted-foreground">{command.text}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-border">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send)"
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !message.trim()}
            size="icon"
            aria-label={isLoading ? "Bot is thinking" : "Send message"}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-muted-foreground animate-pulse">AI is thinking...</span>
              </span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Command Shortcuts */}
        <div className="flex gap-1 mt-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setMessage("I need help with my account")}
          >
            Account Help
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setMessage("How do I contact support?")}
          >
            Contact Support
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setMessage("Show me available features")}
          >
            Features
          </Button>
        </div>
      </div>

      {/* Rating Popup */}
      {showRatingPopup && (
        <RatingPopup
          sessionId={sessionId || "anonymous"}
          isOpen={showRatingPopup}
          onClose={() => setShowRatingPopup(false)}
          messageCount={messageCount}
        />
      )}
    </div>
  );
}