import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("VITE_SUPABASE_URL") ?? "",
  Deno.env.get("VITE_SUPABASE_ANON_KEY") ?? ""
);

async function check() {
  const { data, error } = await supabase.from("tickets").select("workshop_day1, workshop_day2");
  console.log(data);
  if (error) console.error(error);
}
check();
