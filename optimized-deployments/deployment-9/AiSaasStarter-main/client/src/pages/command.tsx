import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommand } from "@/hooks/use-command";
import { Play, Terminal, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Command } from "@shared/schema";

const quickCommands = [
  "List all customers",
  "Generate monthly report", 
  "Update quote statuses",
  "Send welcome emails",
  "Backup database"
];

const workflowOptions = [
  { value: "", label: "Select Workflow" },
  { value: "customer-report", label: "Customer Report" },
  { value: "quote-generation", label: "Quote Generation" },
  { value: "email-campaign", label: "Email Campaign" },
  { value: "data-export", label: "Data Export" },
];

export default function Command() {
  const [command, setCommand] = useState("");
  const [workflow, setWorkflow] = useState("");
  const [asyncExecution, setAsyncExecution] = useState(false);
  const [output, setOutput] = useState("# Command execution log\n$ AI Platform Command Center v1.0\n$ Ready to execute commands...\n");

  const { data: commands = [], isLoading: commandsLoading } = useQuery<Command[]>({
    queryKey: ["/api/commands"],
  });

  const { executeCommand, isExecuting } = useCommand({
    onOutput: (result) => {
      const timestamp = new Date().toISOString();
      const newOutput = `\n$ [${timestamp}] Command: ${result.command || command}\n$ [INFO] ${result.message}\n${result.output ? `$ [OUTPUT]\n${result.output}\n` : ""}$ Ready for next command...`;
      setOutput(prev => prev + newOutput);
    },
  });

  const handleExecute = async () => {
    if (!command.trim()) return;

    const commandToExecute = command;
    
    try {
      await executeCommand(commandToExecute, asyncExecution);
      if (!asyncExecution) {
        setCommand("");
      }
    } catch (error) {
      const timestamp = new Date().toISOString();
      const errorOutput = `\n$ [${timestamp}] ERROR: Failed to execute command\n$ ${error instanceof Error ? error.message : "Unknown error"}\n$ Ready for next command...`;
      setOutput(prev => prev + errorOutput);
    }
  };

  const handleQuickCommand = (quickCommand: string) => {
    setCommand(quickCommand);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-2">Execute commands and trigger backend workflows with AI assistance.</p>
        </div>

        <Card className="shadow-sm mb-6">
          {/* Command Input */}
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Command Input
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your command or prompt here... (e.g., 'Generate a report of all active customers', 'Update quote status for QT-001', 'Send welcome email to all new users')"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                rows={4}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={workflow} onValueChange={setWorkflow}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="async-execution" 
                      checked={asyncExecution}
                      onCheckedChange={(checked) => setAsyncExecution(checked as boolean)}
                    />
                    <label htmlFor="async-execution" className="text-sm text-muted-foreground">
                      Async Execution
                    </label>
                  </div>
                </div>
                <Button 
                  onClick={handleExecute} 
                  disabled={!command.trim() || isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Command Output */}
          <CardContent className="p-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Command Output</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
            
            <div className="bg-slate-950 text-green-400 rounded-lg p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
              <pre className="whitespace-pre-wrap">{output}</pre>
              <span className="animate-pulse">_</span>
            </div>
          </CardContent>

          {/* Quick Commands */}
          <CardContent className="p-6 border-t border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Commands</h3>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((quickCommand) => (
                <Button
                  key={quickCommand}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCommand(quickCommand)}
                  className="text-xs"
                >
                  {quickCommand}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Command History */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Command History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {commandsLoading ? (
              <div className="p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : commands.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No commands executed yet. Run your first command to see the history.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {cmd.command}
                      </span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cmd.status)}
                        <span className="text-xs text-muted-foreground">
                          {cmd.createdAt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {cmd.output && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {cmd.output}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
