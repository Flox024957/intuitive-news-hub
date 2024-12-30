import { useState } from "react";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Navigation } from "@/components/Navigation";

// Temporary mock data
const featuredVideo = {
  title: "L'avenir de l'IA : Nouvelles frontières",
  summary: "Une exploration approfondie de l'impact de l'intelligence artificielle sur la société et de ce que l'avenir réserve à l'humanité.",
  thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  category: "Technologie",
};

const videos = Array(8).fill({
  title: "Comprendre les tendances économiques mondiales",
  summary: "Une analyse complète des modèles économiques actuels et leurs implications pour l'avenir.",
  thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop",
  category: "Économie",
  date: "2024-02-20",
});

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Navigation />
      <div className="min-h-screen container py-8 space-y-8 animate-fade-up mt-16">
        <FeaturedVideo {...featuredVideo} />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dernières vidéos</h2>
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          
          <div className="content-grid">
            {videos.map((video, index) => (
              <VideoCard
                key={index}
                {...video}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;