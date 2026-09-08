import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Revisa si hay una sesión activa al cargar
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // escucha cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
            }
        )

        // limpieza al desmontar
        return () => subscription.unsubscribe()
    }, [])

    // login con email/password
    async function signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password,
        })
        return { data, error }
    }

    // logout
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    return { session, loading, signIn, signOut }
}