import { supabase } from "@/lib/supabase";

/**
 * Uploads an image to a Supabase Storage bucket.
 * Returns the public URL on success, throws on failure.
 */
export const uploadImage = async (file: File, bucket: string, path: string): Promise<string> => {
  const fileExt = file.name.split('.').pop() || 'jpg';
  // Use a secure UUID for the filename
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes("not found")) {
      throw new Error("Bucket not found");
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
