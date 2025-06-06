
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = location.pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
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
    <header 
      className={`w-full z-50 fixed transition-all duration-500 ease-in-out ${
        scrolled 
          ? "bg-white/90 backdrop-blur-sm shadow-md py-2" 
          : isHomePage 
            ? "bg-transparent py-4" 
            : "bg-primary py-4"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className={`text-2xl font-bold transition-colors duration-300 hover:text-accent ${scrolled ? 'text-primary' : 'text-white'}`}>MyClaim</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/" 
              ? `${scrolled ? 'text-primary' : 'text-white'} after:w-full` 
              : `${scrolled ? 'text-foreground/80' : 'text-white/90'}`
            }`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/dashboard" 
              ? `${scrolled ? 'text-primary' : 'text-white'} after:w-full` 
              : `${scrolled ? 'text-foreground/80' : 'text-white/90'}`
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/submit-claim" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/submit-claim" 
              ? `${scrolled ? 'text-primary' : 'text-white'} after:w-full` 
              : `${scrolled ? 'text-foreground/80' : 'text-white/90'}`
            }`}
          >
            Submit Claim
          </Link>
          <Link 
            to="/chat" 
            className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
              location.pathname === "/chat" 
              ? `${scrolled ? 'text-primary' : 'text-white'} after:w-full` 
              : `${scrolled ? 'text-foreground/80' : 'text-white/90'}`
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
