import { Navigation } from "@/components/Navigation";
import { YouTubeTest } from "@/components/YouTubeTest";
import { TranscriptionTest } from "@/components/TranscriptionTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8 space-y-8">
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test de l'API YouTube</h2>
          <YouTubeTest />
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Test de la Transcription</h2>
          <TranscriptionTest />
        </div>
      </div>
    </div>
  );
};

export default Index;