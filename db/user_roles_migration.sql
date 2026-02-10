
-- Migração para Adição de Funções (Roles)
-- USE infotronic; 

-- 1. Adicionar coluna de função de forma segura (idempotente)
DELIMITER //
CREATE PROCEDURE AddRoleColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'admin' AFTER password;
    END IF;
END //
DELIMITER ;

CALL AddRoleColumn();
DROP PROCEDURE AddRoleColumn;

-- 2. Garantir que o usuário administrador inicial seja SuperAdmin
UPDATE users SET role = 'superadmin' WHERE username = 'admin';
