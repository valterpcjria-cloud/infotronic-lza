-- Migração para adicionar status de ativação de usuários
-- Adiciona a coluna is_active se não existir

DROP PROCEDURE IF EXISTS AddIsActiveColumn;

DELIMITER //

CREATE PROCEDURE AddIsActiveColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;
    END IF;
END //

DELIMITER ;

CALL AddIsActiveColumn();

DROP PROCEDURE IF EXISTS AddIsActiveColumn;
