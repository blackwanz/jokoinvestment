import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwvfqeahbjaogquqwagb.supabase.co'; // Ganti ini
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dmZxZWFoYmphb2dxdXF3YWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTE0NjEsImV4cCI6MjA2NDc2NzQ2MX0.QPhOsAE0W0aoOC3WDlrUEWrKn_pqOsmsV5uRyY8oAk0';            // Ganti ini

const supabase = createClient(supabaseUrl, supabaseKey);
// Now you can use the supabase client
async function uploadFile(file) {
  const { data, error } = await supabase
    .storage
    .from('photos')
    .upload(file.name, file);

  if (error) {
    console.error('Error uploading file:', error);
  } else {
    console.log('File uploaded:', data);
  }
}
export default supabase;

