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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-[90vh] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
      <motion.img
        src={featuredVideo.thumbnail_url}
        alt={featuredVideo.title}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      <div className="container relative z-10 h-full flex items-end pb-32">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl space-y-6"
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
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </Button>
      </motion.div>
    </motion.div>
  );
}