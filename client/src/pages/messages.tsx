import { useState } from "react";
import { ChatThread } from "@/components/chat-thread";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const currentUserId = 1; // In a real app, this would come from auth context

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Chat with businesses and customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedUserId ? (
            <ChatThread
              userId1={currentUserId}
              userId2={selectedUserId}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
