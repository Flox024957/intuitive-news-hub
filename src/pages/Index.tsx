import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Rocket, Award, Heart, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Mémorisation des animations pour éviter des re-rendus inutiles
  const containerAnimation = useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }), []);

  const itemAnimation = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }), []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/home');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = useMemo(() => [
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Transcription Instantanée",
      description: "Conversion automatique de vos vidéos en texte en temps réel"
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Qualité Premium",
      description: "Analyses détaillées et résumés intelligents de vos contenus"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Expérience Personnalisée",
      description: "Contenu adapté à vos préférences et centres d'intérêt"
    }
  ], []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Optimisé avec Framer Motion */}
      <motion.section 
        className="container pt-32 pb-20"
        initial="hidden"
        animate="show"
        variants={containerAnimation}
      >
        <motion.div 
          className="text-center space-y-6"
          variants={itemAnimation}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gradient">
            Info-Direct-France
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Votre plateforme d'information en direct, alimentée par l'intelligence artificielle
          </p>
          <motion.div 
            className="flex justify-center gap-4"
            variants={itemAnimation}
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg hover-lift"
            >
              Commencer gratuitement
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section - Optimisé avec grid et carte en verre */}
      <motion.section 
        className="container py-20"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemAnimation}
              className="glass-card p-6 space-y-4 hover-lift"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section - Optimisé avec animation et style */}
      <motion.section 
        className="container py-20"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          variants={itemAnimation}
          className="glass-card p-8 text-center space-y-6 max-w-3xl mx-auto hover-lift"
        >
          <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
          <p className="text-lg text-muted-foreground">
            Rejoignez Info-Direct-France et découvrez une nouvelle façon de consommer l'information
          </p>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Inscription rapide et gratuite</span>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg hover-lift"
          >
            S'inscrire maintenant
          </Button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Index;