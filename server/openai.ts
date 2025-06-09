import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY 
});

export interface ProjectAnalysis {
  framework: string;
  dependencies: string[];
  entryPoint: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
  environmentVariables?: string[];
  issues: string[];
  recommendations: string[];
  confidence: number;
}

export interface DeploymentGuidance {
  steps: string[];
  configFiles: Array<{
    filename: string;
    content: string;
  }>;
  commands: string[];
  warnings: string[];
}

export class AIAssistant {
  async analyzeProject(files: Array<{ name: string; content: string }>): Promise<ProjectAnalysis> {
    try {
      const filesList = files.map(f => `${f.name}:\n${f.content.slice(0, 2000)}`).join('\n\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert deployment assistant. Analyze the provided project files and identify the framework, dependencies, entry point, and any deployment issues. Respond with JSON in this exact format:
            {
              "framework": "string (e.g., React, FastAPI, Django, Express)",
              "dependencies": ["array of key dependencies"],
              "entryPoint": "string (main file)",
              "buildCommand": "string or null",
              "startCommand": "string",
              "port": number or null,
              "environmentVariables": ["array of required env vars"],
              "issues": ["array of potential deployment issues"],
              "recommendations": ["array of recommendations"],
              "confidence": number between 0 and 1
            }`
          },
          {
            role: "user",
            content: `Analyze this project:\n\n${filesList}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  }

  async getDeploymentGuidance(
    framework: string, 
    targetServer: string, 
    issues: string[]
  ): Promise<DeploymentGuidance> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a deployment expert. Provide step-by-step guidance for deploying a ${framework} application to ${targetServer}. Address any specific issues mentioned. Respond with JSON in this exact format:
            {
              "steps": ["array of deployment steps"],
              "configFiles": [{"filename": "string", "content": "string"}],
              "commands": ["array of shell commands"],
              "warnings": ["array of important warnings"]
            }`
          },
          {
            role: "user",
            content: `Framework: ${framework}\nTarget: ${targetServer}\nIssues to address: ${issues.join(', ')}`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Failed to get deployment guidance: ${error.message}`);
    }
  }

  async chatWithAssistant(
    message: string, 
    context?: { project?: any; deployments?: any[] }
  ): Promise<string> {
    try {
      const systemMessage = context?.project 
        ? `You are a helpful deployment assistant. The user is working on a ${context.project.framework || 'unknown'} project called "${context.project.name}". Current status: ${context.project.status}. Help them with deployment questions.`
        : "You are a helpful deployment assistant. Help users with code deployment, configuration, and troubleshooting questions.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      throw new Error(`Failed to chat with assistant: ${error.message}`);
    }
  }

  async debugDeploymentError(errorLogs: string, framework: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a deployment debugging expert. Analyze the error logs for a ${framework} application and provide specific solutions and next steps.`
          },
          {
            role: "user",
            content: `Please help debug this deployment error:\n\nFramework: ${framework}\n\nError logs:\n${errorLogs}`
          }
        ],
        max_tokens: 800,
      });

      return response.choices[0].message.content || "I couldn't analyze the error logs.";
    } catch (error) {
      throw new Error(`Failed to debug deployment error: ${error.message}`);
    }
  }
}

export const aiAssistant = new AIAssistant();
