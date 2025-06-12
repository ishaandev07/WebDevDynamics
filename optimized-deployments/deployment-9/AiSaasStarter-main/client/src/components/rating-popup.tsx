import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RatingPopupProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  messageCount: number;
}

export function RatingPopup({ sessionId, isOpen, onClose, messageCount }: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/chat/session-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          rating,
          feedback,
          messageCount,
          timestamp: new Date().toISOString()
        })
      });

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our AI assistant.",
      });

      onClose();
    } catch (error) {
      console.error('Session feedback submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            How was your experience?
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You've had {messageCount} conversations with our AI assistant. How would you rate your overall experience?
          </p>
          
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
                disabled={isSubmitting}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
              {rating === 2 && "We appreciate your feedback and will work to improve."}
              {rating === 3 && "Thank you for your feedback. We're always working to improve."}
              {rating === 4 && "Great! We're glad you had a positive experience."}
              {rating === 5 && "Excellent! We're thrilled you found our AI assistant helpful."}
            </div>
          )}
          
          <Textarea
            placeholder="Any additional feedback? (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            disabled={isSubmitting}
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}