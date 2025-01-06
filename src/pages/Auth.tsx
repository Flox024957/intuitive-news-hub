import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
        toast.success("Déjà connecté !");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
        toast.success("Connexion réussie !");
      }
    });

    return () => subscription.unsubscribe();
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-md mx-auto pt-20 p-4">
        <div className="glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gradient">Bienvenue sur Info-Direct-France</h1>
            <p className="text-muted-foreground">
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
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;