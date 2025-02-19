import OpenAI from "openai";
import type { Business } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function matchBusinessesToQuery(
  query: string,
  businesses: Business[]
): Promise<Business[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a business matching expert. Given a user query and list of businesses, rank the businesses by relevance and return their IDs in order. Respond with JSON in this format: { 'matches': number[] }",
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            businesses: businesses.map((b) => ({
              id: b.id,
              description: b.description,
              category: b.category,
              location: b.location,
              services: b.services,
            })),
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    const matchedIds = new Set(result.matches);
    
    return businesses
      .filter((b) => matchedIds.has(b.id))
      .sort((a, b) => {
        return result.matches.indexOf(a.id) - result.matches.indexOf(b.id);
      });
  } catch (error) {
    console.error("Failed to match businesses:", error);
    return businesses;
  }
}
