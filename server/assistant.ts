import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@shared/schema";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024. do not change this unless explicitly requested by the user
export async function getAssistantResponse(messages: Message[]): Promise<string> {
  try {
    const messageHistory = messages.map(msg => ({
      role: msg.isAiAssistant ? "assistant" : "user",
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: `You are an expert home improvement assistant. Your knowledge spans all aspects of home repair, renovation, and maintenance. Keep responses focused on home improvement topics.

Key guidelines:
- If the user asks about non-home improvement topics, politely redirect the conversation back to home improvement
- Remember user's previous questions and context about their home improvement needs
- Provide practical, actionable advice
- If a task might be dangerous, recommend consulting a professional
- Be friendly but professional

Begin with: "How can I help with your home improvement needs today?"`,
      messages: messageHistory,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Assistant response error:", error);
    return "I apologize, but I'm having trouble responding right now. Please try again.";
  }
}