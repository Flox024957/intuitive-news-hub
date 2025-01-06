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
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background z-10" />
        <img
          src={featuredVideo.thumbnail_url}
          alt={featuredVideo.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <div className="container relative z-20 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl w-full mx-auto"
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
        transition={{ delay: 0.4 }}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20"
      >
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-all duration-300"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </Button>
      </motion.div>
    </div>
  );
}