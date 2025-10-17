// Placeholder Supabase adapter (to be wired when STORAGE_DRIVER=supabase)
export async function uploadToSupabase(file: any) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.SUPABASE_BUCKET) {
    throw new Error('Supabase-Konfiguration unvollständig. Setze SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET.');
  }
  // In real implementation: Initialize Supabase client and upload file
  // Here only return placeholder URL
  const fakeUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/placeholder`;
  return { url: fakeUrl };
}
