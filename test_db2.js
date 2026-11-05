import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function test() {
    const { data, error } = await supabase.from('admin_users').select('*').eq('dni', '76548565')
    console.log("admin_users data:", data, error)

    const { data: emailData, error: rpcError } = await supabase.rpc('get_admin_email_by_dni', { p_dni: '76548565' })
    console.log("RPC email:", emailData, rpcError)
}
test()
