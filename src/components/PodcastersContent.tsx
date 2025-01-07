import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { PodcasterGrid } from "@/components/PodcasterGrid";

export function PodcastersContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 px-6"
    >
      <div className="flex items-center gap-3 glass-card p-6 rounded-xl">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gradient">Nos podcasters</h2>
      </div>
      <PodcasterGrid />
    </motion.div>
  );
}