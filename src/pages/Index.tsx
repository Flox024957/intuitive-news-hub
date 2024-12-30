import { useState } from "react";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";

// Temporary mock data
const featuredVideo = {
  title: "The Future of AI: Breaking New Boundaries",
  summary: "An in-depth exploration of artificial intelligence's impact on society and what the future holds for humanity.",
  thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  category: "Technology",
};

const videos = Array(8).fill({
  title: "Understanding Global Economic Trends",
  summary: "A comprehensive analysis of current economic patterns and their implications for the future.",
  thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop",
  category: "Economy",
  date: "2024-02-20",
});

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen container py-8 space-y-8 animate-fade-up">
      <FeaturedVideo {...featuredVideo} />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Videos</h2>
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
  );
};

export default Index;