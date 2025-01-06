import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const { session } = useSessionContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur lors de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-50">
      <div className="container h-full mx-auto px-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-gradient">Info-Direct-France</Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
              >
                <Link to="/auth">Connexion</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}