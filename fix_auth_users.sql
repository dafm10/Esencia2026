-- =========================================================================
-- SCRIPT DE REPARACIÓN DE AUTH.USERS (Corrije error 500 en Login)
-- Ejecuta este script en el SQL Editor de tu panel de Supabase
-- =========================================================================

-- 1. Arreglar los campos nulos
-- Supabase (GoTrue) espera que estos campos sean textos vacíos ('') y no NULL.
-- Cuando un usuario se inserta manualmente vía RPC, a menudo quedan en NULL y causan un error 500.
UPDATE auth.users 
SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, '')
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change IS NULL;

-- 2. Crear las identidades faltantes
-- Todo usuario en auth.users necesita una fila en auth.identities.
-- Si la función RPC no lo hizo, este bloque lo soluciona.
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    id, 
    id::text,
    json_build_object('sub', id, 'email', email)::jsonb, 
    'email', 
    created_at, 
    created_at, 
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM auth.identities)
ON CONFLICT DO NOTHING;

-- NOTA PARA EL FUTURO:
-- Debes actualizar tu función RPC `create_admin_user` para que inserte valores vacíos ('')
-- en confirmation_token, recovery_token, email_change_token_new y email_change
-- y también que inserte automáticamente el registro en la tabla `auth.identities`.
