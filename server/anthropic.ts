import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "@shared/schema";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024. do not change this unless explicitly requested by the user
export async function matchBusinessesToQuery(
  query: string,
  businesses: Business[]
): Promise<Business[]> {
  try {
    console.log("Calling Anthropic API with query:", query);
    console.log("Number of businesses to match:", businesses.length);

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert business matcher. Given this user query: "${query}" and these business profiles: ${JSON.stringify(businesses.map(b => ({
            id: b.id,
            description: b.description,
            category: b.category,
            location: b.location,
            services: b.services,
          })))}, analyze the semantic relationship between what the user needs and what businesses can provide. Consider capabilities, context, and potential solutions even if the exact terms don't match. For example, if a user needs 'home cooling solution', match with businesses offering 'AC installation' or 'HVAC services'. Return a JSON response in this format: { "matches": [business_ids], "reasoning": "explanation" }`,
        },
      ],
    });

    console.log("Received response from Anthropic:", response.content);

    if (!response.content[0] || typeof response.content[0] !== 'object') {
      throw new Error("Invalid response format");
    }

    const content = response.content[0].type === 'text' ? response.content[0].text : null;
    if (!content) {
      throw new Error("No text content in response");
    }

    console.log("Parsed content from response:", content);

    const result = JSON.parse(content);
    console.log("Parsed JSON result:", result);

    const matchedIds = new Set(result.matches);
    console.log("Matched business IDs:", Array.from(matchedIds));

    // Log the AI reasoning for debugging
    console.log("AI Matching Reasoning:", result.reasoning);

    return businesses
      .filter((b) => matchedIds.has(b.id))
      .sort((a, b) => {
        return result.matches.indexOf(a.id) - result.matches.indexOf(b.id);
      });
  } catch (error) {
    console.error("Failed to match businesses:", error);
    return businesses; // Return all businesses as fallback
  }
}