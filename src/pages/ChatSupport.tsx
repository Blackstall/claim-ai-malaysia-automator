
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

type Message = {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// Dummy responses for specific claim rejection reasons
const rejectionResponses = {
  '2': "Thank you for your inquiry about Claim ID: 2. This claim was not approved because there was no police report filed for the incident. For damage claims in public locations like shopping malls, our policy requires a police report to be filed within 24 hours of discovering the damage. Without official documentation, we cannot verify the circumstances of the incident.",
  '4': "Regarding your Claim ID: 4, our records indicate that your insurance policy had expired at the time of the incident. According to our terms, coverage is only valid for incidents that occur during the active policy period. The incident date (May 12, 2025) falls after your policy expiration date (May 1, 2025). We recommend renewing your policy as soon as possible to ensure continuous coverage.",
  '5': "For Claim ID: 5, your claim was not approved because our assessment determined it was an at-fault incident involving mechanical failure. Your policy specifically excludes coverage for engine damage resulting from lack of maintenance or wear and tear. The inspection report indicates that the engine failure was due to inadequate oil levels and delayed regular maintenance, which are considered owner responsibilities under your policy terms."
};

// Generic responses for non-claim specific questions
const genericResponses = [
  "Based on our policy guidelines, claims are typically processed within 5-7 business days after all required documentation has been received.",
  "To renew your policy, you can visit our website and log into your account, or call our customer service at 1-800-555-1234.",
  "Our comprehensive coverage includes protection for accidents, theft, fire, natural disasters, and vandalism. However, it does not cover normal wear and tear or mechanical failures.",
  "If you disagree with a claim decision, you can file an appeal by submitting additional documentation or evidence that supports your case within 30 days of the decision.",
  "The deductible is the amount you pay out of pocket before your insurance coverage begins to pay. For example, if you have a $500 deductible and a $2,000 claim, you would pay $500 and we would cover the remaining $1,500."
];

const ChatSupport = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const searchParams = new URLSearchParams(location.search);
  const claimId = searchParams.get("claim");

  useEffect(() => {
    // Initial greeting message
    const initialMessage = claimId 
      ? `Hello! You're asking about claim ${claimId}. How can I help you with this claim?`
      : "Welcome to MyClaim support! How can I assist you with your insurance claims today?";
      
    setMessages([
      {
        id: 1,
        content: initialMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, [claimId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let responseContent = "";
      
      // Check if user is asking about a specific claim
      if (claimId && (
        inputValue.toLowerCase().includes("why") ||
        inputValue.toLowerCase().includes("rejected") ||
        inputValue.toLowerCase().includes("not approved") ||
        inputValue.toLowerCase().includes("declined")
      )) {
        // Return specific rejection reason if available
        responseContent = rejectionResponses[claimId as keyof typeof rejectionResponses] || 
          "We're reviewing the specific details of your claim. Our claims adjuster will contact you shortly with more information.";
      } else {
        // For other questions, choose a generic response
        const randomIndex = Math.floor(Math.random() * genericResponses.length);
        responseContent = genericResponses[randomIndex];
      }

      const newBotMessage: Message = {
        id: messages.length + 2,
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <div className="border-b bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">MyClaim Support</h2>
                <p className="text-sm text-muted-foreground">AI-powered assistant</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This AI assistant can answer questions about claims, provide recommendations, and explain decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSupport;
