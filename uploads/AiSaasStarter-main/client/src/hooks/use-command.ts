import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CommandResult {
  message: string;
  commandId: number;
  output?: string;
  status: string;
  command?: string;
}

interface UseCommandOptions {
  onOutput?: (result: CommandResult) => void;
  onError?: (error: Error) => void;
}

export function useCommand(options: UseCommandOptions = {}) {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const commandMutation = useMutation({
    mutationFn: async (params: { command: string; async_execution?: boolean }) => {
      const response = await apiRequest("POST", "/api/commands", params);
      return response as CommandResult;
    },
    onSuccess: (result) => {
      options.onOutput?.(result);
      queryClient.invalidateQueries({ queryKey: ["/api/commands"] });
      toast({
        title: "Command Executed",
        description: result.message,
      });
    },
    onError: (error) => {
      options.onError?.(error);
      toast({
        title: "Command Failed",
        description: error.message || "Failed to execute command",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsExecuting(false);
    },
  });

  const executeCommand = async (command: string, asyncExecution: boolean = false) => {
    setIsExecuting(true);
    return commandMutation.mutate({ command, async_execution: asyncExecution });
  };

  return {
    executeCommand,
    isExecuting: isExecuting || commandMutation.isPending,
  };
}