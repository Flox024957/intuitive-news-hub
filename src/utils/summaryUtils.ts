import { supabase } from "@/integrations/supabase/client";

export async function generateSummary(text: string): Promise<string> {
  try {
    console.log('Starting summary generation for text length:', text.length);
    
    const { data, error } = await supabase.functions.invoke('generate-summary', {
      body: { text }
    });

    if (error) {
      console.error('Summary function error:', error);
      throw error;
    }

    if (!data?.summary) {
      throw new Error('No summary text returned');
    }

    console.log('Summary generated successfully');
    return data.summary;
  } catch (error) {
    console.error('Error in generateSummary:', error);
    throw new Error('Failed to generate summary');
  }
}