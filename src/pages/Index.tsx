import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gradient">
            Info-Direct-France
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Votre plateforme d'information en direct, alimentée par l'intelligence artificielle
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg"
            >
              Commencer gratuitement
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold">Transcription Automatique</h3>
            <p className="text-muted-foreground">
              Transformez automatiquement vos vidéos en texte grâce à notre technologie de pointe
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold">Résumés Intelligents</h3>
            <p className="text-muted-foreground">
              Obtenez des résumés concis et pertinents de vos contenus préférés
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="text-xl font-semibold">Personnalisation</h3>
            <p className="text-muted-foreground">
              Une expérience sur mesure avec vos créateurs de contenu favoris
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 text-center space-y-6 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
          <p className="text-lg text-muted-foreground">
            Rejoignez Info-Direct-France et découvrez une nouvelle façon de consommer l'information
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg"
          >
            S'inscrire maintenant
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;