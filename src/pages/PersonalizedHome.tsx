import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Bookmark, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-20 space-y-8 animate-fade-up">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
          <p className="text-muted-foreground">
            Retrouvez ici vos contenus favoris et personnalisés
          </p>
        </div>

        <FeaturedVideo {...featuredVideo} />
        
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="favorites" className="space-x-2">
              <Bookmark className="w-4 h-4" />
              <span>Favoris</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="space-x-2">
              <Clock className="w-4 h-4" />
              <span>Récents</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Tendances</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-6">
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
                  className="hover-card glass-card"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Vidéos récentes</h2>
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
                  className="hover-card glass-card"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tendances</h2>
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
                  className="hover-card glass-card"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PersonalizedHome;