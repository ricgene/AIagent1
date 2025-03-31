import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Mic, MicOff, VolumeX, Volume2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";

interface AIChatThreadProps {
  userId: number;
}

export function AIChatThread({ userId }: AIChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const { register, handleSubmit, reset, setValue, watch } = useForm<{ content: string }>();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isMobile] = useState(window.navigator.userAgent.match(/Mobile|Android|iOS|iPhone|iPad|iPod/i));

  // Initialize with greeting message
  useEffect(() => {
    const greetingMessage: Message = {
      id: Date.now(),
      fromId: 0,
      toId: userId,
      content: "I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
      isAiAssistant: true
    };
    
    setMessages([greetingMessage]);
    speakResponse(greetingMessage.content);
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    const initVoices = async () => {
      try {
        // Some mobile browsers need a user interaction to initialize speech
        if (isMobile) {
          await window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        }

        // Set up voice
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length === 0) {
            console.warn("No voices available for speech synthesis");
          } else {
            console.log("Available voices:", availableVoices.map(v => v.name));
          }
        };

        // Initial load
        loadVoices();

        // Setup voice changed listener
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
          if ('onvoiceschanged' in window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
          }
        };
      } catch (error) {
        console.error("Error initializing speech synthesis:", error);
      }
    };

    initVoices();
  }, [isMobile]);

  // Improved speech synthesis function
  const speakResponse = async (text: string) => {
    if (isMuted) return;

    try {
      if (!window.speechSynthesis) {
        console.error("Speech synthesis not supported");
        return;
      }

      console.log("Attempting to speak:", text);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure utterance with fixed voice
      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices.map(v => v.name));

      // Try to find Google US English Female voice first
      const desiredVoice = voices.find(v => 
        v.name.includes("Google") && 
        v.name.includes("US English") && 
        v.name.includes("Female")
      ) || // Or find any English female voice
      voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes("female") || 
         v.name.includes("Samantha"))
      ) || // Or just any English voice
      voices.find(v => v.lang.startsWith('en'));

      utterance.voice = desiredVoice || null;

      if (!utterance.voice) {
        console.warn("Could not find desired voice. Using default voice.");
      } else {
        console.log("Selected voice:", utterance.voice.name);
      }

      utterance.volume = 1.0;     // Full volume for mobile
      utterance.rate = 1.0;       // Normal speed
      utterance.pitch = 1.0;      // Normal pitch
      utterance.lang = 'en-US';   // Use English US

      // Add detailed event handlers
      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        setIsSpeaking(false);
      };

      // For mobile browsers, try to unlock audio context
      if (isMobile) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioContext();
          await audioContext.resume();
        } catch (error) {
          console.warn("Could not initialize AudioContext:", error);
        }
      }

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setIsSpeaking(false);
    }
  };

  // Update the sendMessage mutation to not send greeting
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      console.log("Sending message:", content);
      const response = await apiRequest("POST", "/api/chat", {
        userId: userId,
        message: content
      });
      const result = await response.json();
      console.log("Received response:", result);
      return [result.userMessage, result.assistantMessage];
    },
    onSuccess: (newMessages) => {
      console.log("Mutation succeeded, updating messages:", newMessages);
      setMessages(prev => {
        const updatedMessages = [...prev, ...newMessages];
        console.log("Updated messages:", updatedMessages);
        // Speak the AI's response
        const aiResponse = newMessages.find((m: Message) => m.isAiAssistant);
        if (aiResponse) {
          console.log('Found AI response to speak:', aiResponse.content);
          speakResponse(aiResponse.content);
        }
        return updatedMessages;
      });
      reset();
      setTranscriptText('');
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;  // Allow continuous recognition
      recognitionRef.current.interimResults = true;  // Get interim results
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        console.log("Speech recognition result event:", event);
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const displayText = (finalTranscript + interimTranscript).trim();
        console.log('Current transcript:', displayText);

        // Update both the state and the form input
        setTranscriptText(displayText);
        setValue("content", displayText, { shouldValidate: true });
      };

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [speechSupported, setValue]);

  const toggleListening = () => {
    if (!isListening) {
      recognitionRef.current?.start();
      setIsListening(true);
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [watch("content"), transcriptText]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Then update the rendering code to safely handle non-array data
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-muted">
                How can I help with your home improvement needs today?
              </Card>
            </div>
          ) : Array.isArray(messages) ? (
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
          ) : (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-muted">
                Error loading messages. Please try again.
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form
        onSubmit={handleSubmit((data) => sendMessage.mutate(data.content))}
        className="border-t p-4 flex gap-2"
      >
        <Textarea
          ref={textareaRef}
          value={watch("content") || transcriptText}
          onChange={(e) => setValue("content", e.target.value)}
          placeholder="Ask about home improvement..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          disabled={sendMessage.isPending}
          rows={1}
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
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => setIsMuted(!isMuted)}
          disabled={sendMessage.isPending}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
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