
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Send, ArrowLeft, Robot } from "lucide-react";
import { claimsService, Claim } from "@/services/claimsService";
import { useToast } from "@/hooks/use-toast";

// Helper function to extract query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatSupport = () => {
  const { toast } = useToast();
  const query = useQuery();
  const claimId = query.get('claim');
  const [claim, setClaim] = useState<Claim | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch claim details if claimId is provided
  useEffect(() => {
    const fetchClaimDetails = async () => {
      if (claimId) {
        try {
          const response = await claimsService.getClaimById(claimId);
          setClaim(response.result);
          
          // Add welcome message based on claim status
          const initialMessage = {
            id: `init-${Date.now()}`,
            content: response.result.approval_flag 
              ? `Welcome! How can I help you with your approved claim ${claimId}?`
              : `I see you're inquiring about claim ${claimId} that wasn't approved. How can I help you?`,
            sender: 'assistant' as const,
            timestamp: new Date()
          };
          
          setMessages([initialMessage]);
          setInitialLoading(false);
        } catch (error) {
          console.error("Error fetching claim:", error);
          toast({
            title: "Error",
            description: "Failed to fetch claim details. Please try again.",
            variant: "destructive",
          });
          setInitialLoading(false);
        }
      } else {
        // General welcome message if no claim ID is provided
        const initialMessage = {
          id: `init-${Date.now()}`,
          content: "Welcome to MyClaim AI support! How can I assist you today?",
          sender: 'assistant' as const,
          timestamp: new Date()
        };
        setMessages([initialMessage]);
        setInitialLoading(false);
      }
    };
    
    fetchClaimDetails();
  }, [claimId, toast]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      let responseContent = "";
      
      if (claimId) {
        // Get specific response for the claim
        const response = await claimsService.getClaimChatResponse(claimId, inputMessage);
        responseContent = response.message;
      } else {
        // General response
        responseContent = "I'm here to help with your insurance claims. If you have a specific claim ID, please provide it so I can give you more detailed information.";
      }
      
      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading chat support...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <Robot className="h-4 w-4" />
                </div>
                <span>AI Support Assistant</span>
              </CardTitle>
            </div>
            
            {claim && (
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${claim.approval_flag 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-400 to-pink-500'} text-white border-0 shadow-sm`}
                >
                  {claim.approval_flag ? 'Approved' : 'Not Approved'}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  ID: {claim.id}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Chat messages */}
          <div className="flex flex-col h-[500px] overflow-y-auto p-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.sender === 'assistant' ? (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary text-white text-xs">AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">ME</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-muted/50 text-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 self-start mb-4">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-white text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-full bg-muted/30 border-muted"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                className="rounded-full bg-primary hover:bg-primary/90 text-white"
                disabled={loading || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSupport;
