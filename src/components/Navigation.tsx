import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export function Navigation() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };
  
  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-gradient">Info-Direct-France</Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {session ? (
              <>
                <Button
                  variant={location.pathname === "/home" ? "default" : "ghost"}
                  asChild
                  className="relative group"
                >
                  <Link to="/home" className="flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Accueil</span>
                  </Link>
                </Button>
                
                <Button
                  variant={location.pathname === "/personal" ? "default" : "ghost"}
                  asChild
                  className="relative group"
                >
                  <Link to="/personal" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Ma page</span>
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </Button>
              </>
            ) : (
              location.pathname !== "/auth" && (
                <Button
                  variant="default"
                  asChild
                  className="relative group"
                >
                  <Link to="/auth" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Connexion</span>
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}