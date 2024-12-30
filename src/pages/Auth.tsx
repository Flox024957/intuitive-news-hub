import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleDemoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@info-direct-france.fr",
        password: "demo123456",
      });

      if (error) throw error;
      
      toast.success("Connexion avec le compte de démonstration réussie");
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur lors de la connexion avec le compte de démonstration");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg animate-fade-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gradient">Info-Direct-France</h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous pour accéder à votre espace personnalisé
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDemoLogin}
          >
            Essayer avec un compte de démonstration
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou connectez-vous avec votre compte
              </span>
            </div>
          </div>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            }
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
              },
              sign_up: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
              },
            }
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;