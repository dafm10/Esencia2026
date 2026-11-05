import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function test() {
    const { error: rpcError } = await supabase.rpc('create_admin_user', {
        p_email: 'test' + Date.now() + '@example.com',
        p_password: 'password123',
        p_dni: '76548565',
        p_full_name: 'Test User',
        p_phone: '123456789',
        p_role: 'admin'
    })
    console.log("Create user error:", rpcError)
}
test()
