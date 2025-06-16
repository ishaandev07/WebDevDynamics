import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatFeedbackProps {
  sessionId: string;
  message: string;
  response: string;
  messageId?: string;
  onFeedbackSubmitted?: () => void;
}

export function ChatFeedback({ 
  sessionId, 
  message, 
  response, 
  messageId,
  onFeedbackSubmitted 
}: ChatFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting feedback.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message,
          response,
          rating,
          feedback,
          messageId
        })
      });

      setHasSubmitted(true);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve our AI assistant!"
      });

      onFeedbackSubmitted?.();
    } catch (error) {
      toast({
        title: "Feedback Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickFeedback = async (isPositive: boolean) => {
    const quickRating = isPositive ? 5 : 2;
    setRating(quickRating);

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message,
          response,
          rating: quickRating,
          feedback: isPositive ? "Helpful response" : "Not helpful",
          messageId
        })
      });

      setHasSubmitted(true);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!"
      });

      onFeedbackSubmitted?.();
    } catch (error) {
      toast({
        title: "Feedback Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="mt-2 border-green-200 dark:border-green-800">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Thank you for your feedback!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-2 border-dashed">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Was this response helpful?</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => quickFeedback(true)}
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => quickFeedback(false)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}} // Toggle detailed feedback
              className="h-8 w-8 p-0"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Detailed Rating */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm text-muted-foreground">
                ({rating}/5)
              </span>
            )}
          </div>

          <Textarea
            placeholder="Additional feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={submitFeedback}
              disabled={isSubmitting || rating === 0}
              size="sm"
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}