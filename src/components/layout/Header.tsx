
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-sm shadow-md py-2" : "bg-white py-4"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary transition-colors duration-300 hover:text-accent">MyClaim</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/" ? "text-primary after:w-full" : "text-foreground/80"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/dashboard" ? "text-primary after:w-full" : "text-foreground/80"
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/submit-claim" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/submit-claim" ? "text-primary after:w-full" : "text-foreground/80"
            }`}
          >
            Submit Claim
          </Link>
          <Link 
            to="/chat" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/chat" ? "text-primary after:w-full" : "text-foreground/80"
            }`}
          >
            Support Chat
          </Link>
        </nav>
        
        <div className="opacity-0">
          {/* Placeholder for login/register buttons to maintain layout */}
          <div className="w-[180px]"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
