export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_cache: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          id: string
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_cache_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          profile_picture_url: string | null
          social_links: Json | null
          youtube_channel_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          profile_picture_url?: string | null
          social_links?: Json | null
          youtube_channel_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          profile_picture_url?: string | null
          social_links?: Json | null
          youtube_channel_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          favorite_podcasters: string[] | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          favorite_podcasters?: string[] | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          favorite_podcasters?: string[] | null
          id?: string
        }
        Relationships: []
      }
      video_stats: {
        Row: {
          created_at: string | null
          id: string
          like_count: number | null
          share_count: number | null
          updated_at: string | null
          video_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          like_count?: number | null
          share_count?: number | null
          updated_at?: string | null
          video_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          like_count?: number | null
          share_count?: number | null
          updated_at?: string | null
          video_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_stats_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          article_content: string | null
          categories: Database["public"]["Enums"]["video_category"][] | null
          created_at: string
          custom_title: string | null
          full_transcript: string | null
          id: string
          podcaster_id: string | null
          published_date: string
          speakers_list: string[] | null
          summary: string | null
          thumbnail_url: string | null
          title: string
          video_url: string
          youtube_video_id: string
        }
        Insert: {
          article_content?: string | null
          categories?: Database["public"]["Enums"]["video_category"][] | null
          created_at?: string
          custom_title?: string | null
          full_transcript?: string | null
          id?: string
          podcaster_id?: string | null
          published_date: string
          speakers_list?: string[] | null
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          video_url: string
          youtube_video_id: string
        }
        Update: {
          article_content?: string | null
          categories?: Database["public"]["Enums"]["video_category"][] | null
          created_at?: string
          custom_title?: string | null
          full_transcript?: string | null
          id?: string
          podcaster_id?: string | null
          published_date?: string
          speakers_list?: string[] | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_podcaster_id_fkey"
            columns: ["podcaster_id"]
            isOneToOne: false
            referencedRelation: "podcasters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      http: {
        Args: {
          request: Database["public"]["CompositeTypes"]["http_request"]
        }
        Returns: unknown
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: unknown
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      import_youtube_videos: {
        Args: {
          channel_id: string
        }
        Returns: undefined
      }
      increment_view_count: {
        Args: {
          video_id_param: string
        }
        Returns: undefined
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
    }
    Enums: {
      video_category:
        | "all"
        | "news"
        | "politics"
        | "economy"
        | "technology"
        | "culture"
        | "personal_development"
        | "humor"
        | "music"
        | "entertainment"
        | "travel"
        | "documentary"
        | "sport"
        | "finance"
        | "tutorial"
        | "kids"
        | "movies"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
