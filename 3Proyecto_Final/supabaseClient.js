// Carga la biblioteca de Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ===================================
// CONFIGURACIÓN DE TU PROYECTO SUPABASe
// ===================================
const SUPABASE_URL = "https://uslhohtotkurtlabuoyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbGhvaHRvdGt1cnRsYWJ1b3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjExMTAsImV4cCI6MjA3NjEzNzExMH0.jXwM0zRTakBiCVSKGWsGtgZRGkHVNBSVOyZr3bw5RYI";

// Crea y exporta el cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);