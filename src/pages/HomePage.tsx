
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, FileText, MessageSquare, ArrowRight, Send, FileCheck, BarChart3 } from "lucide-react";
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
    <div className="flex flex-col min-h-screen pt-24">
      {/* Hero Section with Parallax */}
      <section className="gradient-bg text-white py-28 md:py-32 relative overflow-hidden">
        <div ref={parallaxRef} className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in">
            Automated Insurance Claims Processing
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90 animate-slide-up">
            MyClaim uses AI technology to validate and process insurance claims quickly and accurately,
            following Malaysian insurance regulations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg group">
              <Link to="/submit-claim" className="flex items-center">
                <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Submit a Claim
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg group">
              <Link to="/dashboard" className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <SectionHeader title="How MyClaim Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  <FileText className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Submit Documents</h3>
                <p className="text-muted-foreground">
                  Upload your police report and accident photos through our secure portal.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  <FileCheck className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes reports and images to validate claims using advanced document analysis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  <MessageSquare className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Get Results</h3>
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
              <Button asChild className="w-full group hover:scale-[1.02] transition-all duration-300">
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
