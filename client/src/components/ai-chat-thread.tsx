import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface AIChatThreadProps {
  userId: number;
}

export function AIChatThread({ userId }: AIChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm<{ content: string }>();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const queryKey = [`/api/messages/ai/${userId}`];

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices(); // Try loading immediately
    window.speechSynthesis.onvoiceschanged = loadVoices; // Load when voices become available

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue("content", transcript);
        handleSubmit((data) => sendMessage.mutate(data.content))();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [speechSupported, setValue, handleSubmit]);

  // Speech synthesis for AI responses
  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Select a more natural-sounding voice
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') || // Prefer Google voices if available
      voice.name.includes('Natural') ||
      voice.name.includes('Premium')
    ) || voices[0];

    // Customize voice settings
    utterance.voice = preferredVoice;
    utterance.pitch = 1.0;  // Natural pitch
    utterance.rate = 0.9;   // Slightly slower rate for clarity
    utterance.volume = 1.0; // Full volume

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!isListening) {
      recognitionRef.current?.start();
      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      console.log("Sending message:", content);
      const response = await apiRequest("POST", "/api/messages/ai", {
        fromId: userId,
        content,
      });
      const newMessages: Message[] = await response.json();
      console.log("Received new messages:", newMessages);
      return newMessages;
    },
    onSuccess: (newMessages) => {
      console.log("Mutation succeeded, updating messages:", newMessages);
      queryClient.setQueryData(queryKey, (old: Message[] = []) => {
        console.log("Old messages:", old);
        const updatedMessages = [...old, ...newMessages];
        console.log("Updated messages:", updatedMessages);
        // Speak the AI's response
        const aiResponse = newMessages.find(m => m.isAiAssistant);
        if (aiResponse) {
          speakResponse(aiResponse.content);
        }
        return updatedMessages;
      });
      reset();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <Card className="max-w-[80%] p-3 bg-muted">
              How can I help with your home improvement needs today?
            </Card>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                !message.isAiAssistant ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  !message.isAiAssistant
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit((data) => sendMessage.mutate(data.content))}
        className="border-t p-4 flex gap-2"
      >
        <Input
          {...register("content", { required: true })}
          placeholder="Ask about home improvement..."
          className="flex-1"
          disabled={sendMessage.isPending || isListening}
        />
        {speechSupported && (
          <Button
            type="button"
            size="icon"
            variant={isListening ? "destructive" : "secondary"}
            onClick={toggleListening}
            disabled={sendMessage.isPending}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending || isListening}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}