
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, FileText, MessageSquare, ArrowRight, Send, FileCheck, BarChart3, CircleDot } from "lucide-react";
import { useEffect, useRef } from "react";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center mb-12">
    <h2 className="text-3xl md:text-4xl font-bold text-center relative">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{title}</span>
    </h2>
    <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full"></div>
  </div>
);

const HomePage = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollTop = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrollTop * 0.3}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=2069&auto=format&fit=crop" 
            alt="People discussing insurance claims" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A3675]/90 via-[#0A4D8C]/90 to-[#05A5A5]/90"></div>
        </div>
        
        {/* Floating elements for visual effect */}
        <div ref={parallaxRef} className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute top-1/3 right-[20%] w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
          <div className="absolute bottom-1/3 left-[25%] w-56 h-56 rounded-full bg-white/10 blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-20 mt-[-80px]">
          <p className="text-white/80 text-lg mb-4 animate-fade-in">Insurance technology for the modern world</p>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in leading-tight">
            Automated Insurance <br /> Claims Processing
          </h1>
          
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-white/90 animate-slide-up">
            MyClaim uses AI technology to validate and process insurance claims quickly and accurately,
            following Malaysian insurance regulations.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up">
            <Button asChild size="lg" variant="green" className="hover:scale-105 transition-all duration-300 shadow-lg group text-base px-8 py-6">
              <Link to="/submit-claim" className="flex items-center">
                <CircleDot className="mr-3 h-5 w-5 transition-transform group-hover:text-white" />
                Submit a Claim
              </Link>
            </Button>
            <Button asChild size="lg" variant="green" className="hover:scale-105 transition-all duration-300 shadow-lg group text-base px-8 py-6">
              <Link to="/dashboard" className="flex items-center">
                <BarChart3 className="mr-3 h-5 w-5 transition-transform group-hover:text-white" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white z-10" style={{
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
          transform: 'scale(2)',
          transformOrigin: 'bottom'
        }}></div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <SectionHeader title="How MyClaim Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <FileText className="text-primary h-8 w-8 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">1. Submit Documents</h3>
                <p className="text-muted-foreground">
                  Upload your police report and accident photos through our secure portal.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <FileCheck className="text-primary h-8 w-8 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes reports and images to validate claims using advanced document analysis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <MessageSquare className="text-primary h-8 w-8 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">3. Get Results</h3>
                <p className="text-muted-foreground">
                  Receive claim decisions promptly and chat with our AI assistant for explanations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader title="Why Choose MyClaim" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-8">
                <li className="flex gap-5 group">
                  <div className="rounded-full bg-accent/20 w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-accent/40">
                    <CheckCircle className="text-accent h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors duration-300">Fast Processing</h3>
                    <p className="text-muted-foreground">
                      AI-powered validation reduces claim processing time from weeks to days.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-5 group">
                  <div className="rounded-full bg-accent/20 w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-accent/40">
                    <CheckCircle className="text-accent h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors duration-300">Malaysian Regulation Compliant</h3>
                    <p className="text-muted-foreground">
                      Our system follows all Malaysian insurance regulations and requirements.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-5 group">
                  <div className="rounded-full bg-accent/20 w-12 h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-accent/40">
                    <CheckCircle className="text-accent h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors duration-300">Smart Support</h3>
                    <p className="text-muted-foreground">
                      AI chatbot provides explanations and recommendations based on your claim.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/80 to-secondary/30 rounded-xl p-8 border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-6">
                Submit your claim now and experience our streamlined processing system. Our AI-powered platform will guide you through each step.
              </p>
              <Button asChild variant="green" className="w-full hover:scale-[1.02] transition-all duration-300">
                <Link to="/submit-claim" className="flex items-center justify-center">
                  Start Your Claim <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
