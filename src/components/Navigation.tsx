import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User } from "lucide-react";

export function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-gradient">Info-Direct-France</Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              asChild
            >
              <Link to="/" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === "/personal" ? "default" : "ghost"}
              asChild
            >
              <Link to="/personal" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Ma page</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}