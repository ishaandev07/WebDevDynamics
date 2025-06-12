import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatResponse {
  reply: string;
  sessionId: string;
  confidence?: number;
  category?: string;
  results?: Array<{
    input: string;
    output: string;
    similarity: number;
    source: string;
  }>;
}

interface UseChatOptions {
  onMessage: (response: ChatResponse) => void;
}

export function useChat({ onMessage }: UseChatOptions) {
  const mutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId?: string }) => {
      const response = await apiRequest("POST", "/api/chat", { message, sessionId });
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      onMessage(data);
    },
  });

  const sendMessage = async (message: string, sessionId?: string) => {
    return mutation.mutateAsync({ message, sessionId });
  };

  return {
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
