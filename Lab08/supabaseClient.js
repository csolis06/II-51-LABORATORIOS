import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================
// // CONFIGURA TU SUPABASE
// // =======================
let SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYmNqYmRoeWtjZm15aWt6YWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDUzMzksImV4cCI6MjA3NjEyMTMzOX0.XqAWGgGpyv6hYzV6f_rUfs5O-uxyhhijSOuMoXi0wZM";
let SUPABASE_URL = "https://nebcjbdhykcfmyikzaig.supabase.co";

// // Crear cliente una sola vez
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);  
