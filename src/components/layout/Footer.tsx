
import { Link } from "react-router-dom";
import { Mail, Phone, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary/90 to-accent/90 text-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              MyClaim
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/70 rounded-full"></span>
            </h3>
            <p className="text-white/90 text-sm">
              Automating insurance claims with AI-powered validation and processing.
            </p>
            <div className="pt-4 flex space-x-4">
              {/* Social media icons would go here */}
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"></div>
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"></div>
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-300"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/70 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Home
                </Link>
              </li>
              <li>
                <Link to="/submit-claim" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Submit Claim
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              Resources
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/70 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/faq" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> FAQ
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Support Chat
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Documentation
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-5 relative inline-block">
              Contact
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/70 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="text-white/90 flex items-center">
                <Mail className="w-4 h-4 mr-2" /> support@myclaim.com
              </li>
              <li className="text-white/90 flex items-center">
                <Phone className="w-4 h-4 mr-2" /> +60 3-1234 5678
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-xs text-white/70 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} MyClaim. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-white/70">
            <Link to="/privacy" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
