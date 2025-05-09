
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

  const handleSend = () => {
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

    // Simulate AI response after a short delay
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        "rejected": "Based on our analysis, the claim was rejected because the damage reported doesn't match the incident description in the police report. Additionally, the photos submitted show pre-existing damage that predates the reported incident. You may appeal this decision by providing additional documentation or evidence.",
        "approved": "Your claim has been approved based on the documentation provided. The police report and photos clearly matched the incident description, and all policy requirements were met. The payment will be processed within 5-7 business days.",
        "processing": "Your claim is still being processed. Our AI system is analyzing the documents and photos submitted. We need to verify some details with the appropriate authorities, which is why there's a delay. You should receive an update within 48 hours.",
        "submitted": "Your claim was recently submitted and is currently in the initial review stage. Our AI system will begin analyzing your documents shortly. The typical processing time is 3-5 business days for similar claims."
      };
      
      let responseContent = "";
      
      // If asking about a claim, provide specific response based on claim status
      if (claimId) {
        const claimNumber = claimId.split('-')[2];
        const mockStatus = ["approved", "processing", "rejected", "submitted"][parseInt(claimNumber) % 4];
        
        if (inputValue.toLowerCase().includes("why") && mockStatus === "rejected") {
          responseContent = botResponses["rejected"];
        } else if (inputValue.toLowerCase().includes("status") || inputValue.toLowerCase().includes("update")) {
          responseContent = botResponses[mockStatus];
        } else if (inputValue.toLowerCase().includes("repair") || inputValue.toLowerCase().includes("workshop")) {
          responseContent = "Based on your location and claim details, I recommend these nearby authorized repair workshops:\n\n1. AutoCare Workshop - 3.2km away\n2. SpeedFix Auto Centre - 4.5km away\n3. Master Auto Repair - 5.1km away\n\nWould you like me to provide contact details for any of these?";
        } else {
          responseContent = "I understand you're asking about claim " + claimId + ". What specific information would you like to know? You can ask about the claim status, payment details, or repair workshop recommendations.";
        }
      } else {
        // General responses
        if (inputValue.toLowerCase().includes("hello") || inputValue.toLowerCase().includes("hi")) {
          responseContent = "Hello! How can I help you with your insurance claim today?";
        } else if (inputValue.toLowerCase().includes("process")) {
          responseContent = "The claim process involves submitting your police report and accident photos through our portal. Our AI then analyzes these documents to validate your claim according to Malaysian insurance regulations. You'll be notified once a decision is made.";
        } else if (inputValue.toLowerCase().includes("document") || inputValue.toLowerCase().includes("need")) {
          responseContent = "For a complete claim submission, you'll need:\n\n1. Police report\n2. Clear photos of the damage\n3. Your identification document\n4. Insurance policy details\n5. Bank account information for reimbursement";
        } else {
          responseContent = "Thank you for your question. Our AI-powered system is designed to provide fast and accurate claim processing. If you have specific questions about claim submission or the status of an existing claim, please let me know.";
        }
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
