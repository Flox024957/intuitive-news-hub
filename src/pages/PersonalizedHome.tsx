import { useState } from "react";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";

const PersonalizedHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Données temporaires pour les vidéos favorites (à remplacer par les données Supabase)
  const featuredVideo = {
    title: "Les dernières actualités tech en France",
    summary: "Un résumé complet des actualités technologiques de la semaine en France et en Europe.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    category: "Technologie",
  };

  const favoriteVideos = Array(8).fill({
    title: "Analyse de l'actualité économique",
    summary: "Une analyse approfondie des tendances économiques actuelles et leurs implications.",
    thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop",
    category: "Économie",
    date: "2024-02-20",
  });

  return (
    <div className="min-h-screen container py-8 space-y-8 animate-fade-up">
      <h1 className="text-3xl font-bold mb-6">Ma page personnalisée</h1>
      <FeaturedVideo {...featuredVideo} />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mes vidéos favorites</h2>
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
        
        <div className="content-grid">
          {favoriteVideos.map((video, index) => (
            <VideoCard
              key={index}
              {...video}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHome;