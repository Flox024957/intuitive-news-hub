import { type Database } from "@/integrations/supabase/types";
import { FeaturedVideo } from "@/components/FeaturedVideo";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface PersonalizedHeaderProps {
  featuredVideo: Video | undefined;
}

export function PersonalizedHeader({ featuredVideo }: PersonalizedHeaderProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
        <p className="text-muted-foreground">
          Retrouvez ici les dernières vidéos de vos podcasters favoris
        </p>
      </div>

      {featuredVideo && (
        <FeaturedVideo
          title={featuredVideo.custom_title || featuredVideo.title}
          summary={featuredVideo.summary || ""}
          thumbnail={featuredVideo.thumbnail_url || ""}
          category={featuredVideo.categories?.[0] || "Actualités"}
        />
      )}
    </div>
  );
}