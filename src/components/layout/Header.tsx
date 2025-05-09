
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">MyClaim</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/" ? "text-primary" : "text-foreground/80"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/dashboard" ? "text-primary" : "text-foreground/80"
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/submit-claim" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/submit-claim" ? "text-primary" : "text-foreground/80"
            }`}
          >
            Submit Claim
          </Link>
          <Link 
            to="/chat" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/chat" ? "text-primary" : "text-foreground/80"
            }`}
          >
            Support Chat
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline">Log in</Button>
          <Button>Register</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
