import { motion } from "framer-motion";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeHeroProps {
  featuredVideo: any;
}

export function HomeHero({ featuredVideo }: HomeHeroProps) {
  if (!featuredVideo) return null;

  return (
    <div className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background z-10" />
        <img
          src={featuredVideo.thumbnail_url}
          alt={featuredVideo.title}
          className="w-full h-full object-cover transform scale-105"
        />
      </motion.div>
      
      <div className="container relative z-20 max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <FeaturedVideo
            title={featuredVideo.custom_title || featuredVideo.title}
            summary={featuredVideo.summary || ""}
            thumbnail={featuredVideo.thumbnail_url || ""}
            category={featuredVideo.categories?.[0] || "Actualités"}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all duration-300"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </Button>
      </motion.div>
    </div>
  );
}