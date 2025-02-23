import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface AIChatThreadProps {
  userId: number;
}

export function AIChatThread({ userId }: AIChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue } = useForm<{ content: string }>();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const queryKey = [`/api/messages/ai/${userId}`];

  // Define sendMessage mutation first
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
          console.log('Found AI response to speak:', aiResponse.content);
          speakResponse(aiResponse.content);
        }
        return updatedMessages;
      });
      reset();
    },
  });

  // Query for messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey,
  });

  // Load available voices and select default
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      console.log("Available voices:", availableVoices.map(v => `${v.name} (${v.lang})`));

      if (availableVoices.length > 0) {
        setVoices(availableVoices);

        // Find a suitable default voice (female US English)
        const defaultVoice = availableVoices.find(voice =>
          voice.lang === 'en-US' &&
          voice.name.toLowerCase().includes('female') &&
          !voice.name.toLowerCase().includes('german')
        )?.name || availableVoices[0].name;

        console.log("Selected default voice:", defaultVoice);
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices(); // Try loading immediately
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;  // Allow continuous recognition
      recognitionRef.current.interimResults = true;  // Get interim results
      recognitionRef.current.maxAlternatives = 1;

      let finalTranscript = '';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the input field with current transcription
        const content = finalTranscript.trim() + ' ' + interimTranscript;
        setValue("content", content);

        // Scroll the input to show the latest text
        if (inputRef.current) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [speechSupported, setValue]);

  // Speech synthesis for AI responses
  const speakResponse = (text: string) => {
    try {
      console.log('Speaking response:', text);
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Use the selected voice
      const voice = voices.find(v => v.name === selectedVoice);
      console.log('Using voice:', voice?.name);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = 'en-US';  // Force US English
        utterance.pitch = 1.1;     // Slightly higher pitch for more natural female voice
        utterance.rate = 1.0;      // Normal speaking rate
        utterance.volume = 0.9;    // Slightly reduced volume to sound more natural

        // Add event handlers to track speech status
        utterance.onstart = () => console.log('Started speaking');
        utterance.onend = () => console.log('Finished speaking');
        utterance.onerror = (e) => console.error('Speech error:', e);

        window.speechSynthesis.speak(utterance);
      } else {
        console.error('Selected voice not found:', selectedVoice);
      }
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px]">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Assistant Voice:</label>
          <Select
            value={selectedVoice || undefined}
            onValueChange={setSelectedVoice}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices
                .filter(voice => voice.lang === 'en-US')
                .map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        <div className="space-y-4">
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
      </div>
      <form
        onSubmit={handleSubmit((data) => sendMessage.mutate(data.content))}
        className="border-t p-4 flex gap-2"
      >
        <Input
          {...register("content", { required: true })}
          ref={inputRef}
          placeholder="Ask about home improvement..."
          className="flex-1 overflow-x-auto whitespace-nowrap"
          disabled={sendMessage.isPending}
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
          disabled={sendMessage.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}