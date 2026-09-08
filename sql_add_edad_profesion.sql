-- Script para añadir los campos edad y profesion a la base de datos
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS edad VARCHAR(10),
ADD COLUMN IF NOT EXISTS profesion VARCHAR(100);
