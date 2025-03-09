import { useState } from "react";
import { ChatThread } from "@/components/chat-thread";
import { AIChatThread } from "@/components/ai-chat-thread";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot } from "lucide-react";

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showingAiChat, setShowingAiChat] = useState(false);
  const currentUserId = 1; // In a real app, this would come from auth context

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Chat with businesses and our PRIZM agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedUserId && !showingAiChat ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full py-8 text-lg"
                onClick={() => setShowingAiChat(true)}
              >
                <Bot className="w-6 h-6 mr-2" />
                Chat with PRIZM agent
              </Button>
              <div className="text-center py-4 text-muted-foreground">
                Or select a business conversation
              </div>
            </div>
          ) : showingAiChat ? (
            <div>
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setShowingAiChat(false)}
              >
                ← Back to conversations
              </Button>
              <AIChatThread userId={currentUserId} />
            </div>
          ) : (
            <div>
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setSelectedUserId(null)}
              >
                ← Back to conversations
              </Button>
              <ChatThread
                userId1={currentUserId}
                userId2={selectedUserId}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}