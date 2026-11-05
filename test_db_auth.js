import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ale.dan2005@gmail.com',
        password: 'wrongpassword123'
    })
    console.log("Auth result:", data, error)
}
test()
