
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, FileText, MessageSquare, ArrowRight } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in">
            Automated Insurance Claims Processing
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 opacity-90 animate-slide-up">
            MyClaim uses AI technology to validate and process insurance claims quickly and accurately,
            following Malaysian insurance regulations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/submit-claim">Submit a Claim</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How MyClaim Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Submit Documents</h3>
                <p className="text-muted-foreground">
                  Upload your police report and accident photos through our secure portal.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes reports and images to validate claims using advanced document analysis.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Get Results</h3>
                <p className="text-muted-foreground">
                  Receive claim decisions promptly and chat with our AI assistant for explanations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MyClaim</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="rounded-full bg-accent/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Fast Processing</h3>
                    <p className="text-muted-foreground">
                      AI-powered validation reduces claim processing time from weeks to days.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="rounded-full bg-accent/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Malaysian Regulation Compliant</h3>
                    <p className="text-muted-foreground">
                      Our system follows all Malaysian insurance regulations and requirements.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="rounded-full bg-accent/10 w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-accent h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Smart Support</h3>
                    <p className="text-muted-foreground">
                      AI chatbot provides explanations and recommendations based on your claim.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-secondary rounded-xl p-8 border border-border/30">
              <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
              <p className="text-muted-foreground mb-6">
                Submit your claim now and experience our streamlined processing system. Our AI-powered platform will guide you through each step.
              </p>
              <Button asChild className="w-full">
                <Link to="/submit-claim" className="flex items-center justify-center">
                  Start Your Claim <ArrowRight className="ml-2 h-4 w-4" />
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
