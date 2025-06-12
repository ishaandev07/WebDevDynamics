import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageFeedbackProps {
  sessionId: string;
  messageId: string;
  userMessage: string;
  botResponse: string;
}

export function MessageFeedback({ 
  sessionId, 
  messageId, 
  userMessage, 
  botResponse 
}: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (isPositive: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedback(isPositive ? 'positive' : 'negative');

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messageId,
          userMessage,
          botResponse,
          feedback: isPositive,
          rating: isPositive ? 5 : 2,
          timestamp: new Date().toISOString()
        })
      });

      toast({
        title: "Thank you!",
        description: "Your feedback helps improve our AI assistant.",
      });
    } catch (error) {
      console.error('Feedback submission failed:', error);
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-60 hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => submitFeedback(true)}
        disabled={isSubmitting}
        className={`h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900 ${
          feedback === 'positive' ? 'bg-green-100 dark:bg-green-900 text-green-600' : ''
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => submitFeedback(false)}
        disabled={isSubmitting}
        className={`h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 ${
          feedback === 'negative' ? 'bg-red-100 dark:bg-red-900 text-red-600' : ''
        }`}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}