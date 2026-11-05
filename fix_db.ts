import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("VITE_SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("VITE_SUPABASE_ANON_KEY") ?? ""
);

async function fix() {
  const { data, error } = await supabase
    .from("tickets")
    .update({ workshop_day2: "1.- ¿Quien soy yo cuando nadie me ve? / Saida" })
    .eq("workshop_day2", "2.- ¿Quién soy yo cuando nadie me ve? / Lic. en Psic. Saida Segovia");
    
  if (error) console.error("Error updating:", error);
  else console.log("Fixed records:", data);
}
fix();
