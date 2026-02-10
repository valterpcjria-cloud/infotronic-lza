-- SCRIPT CONSOLIDADO: Criar Tabela de Usuários e Configurar Funções (Roles)
-- Certifique-se de estar no banco de dados correto (ex: meusis41_frimelo_db)

-- 1. Criar a tabela 'users' se ela não existir
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Inserir usuário administrador padrão (se não existir)
-- Senha padrão: admin123
INSERT IGNORE INTO users (username, password, name) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Infotronic');

-- 3. Adicionar coluna 'role' de forma segura
DROP PROCEDURE IF EXISTS AddRoleColumn;
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
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'created_by') THEN
        ALTER TABLE users ADD COLUMN created_by INT DEFAULT NULL;
    END IF;
END //
DELIMITER ;

CALL AddRoleColumn();
DROP PROCEDURE AddRoleColumn;

-- 4. Garantir que o administrador principal seja SuperAdmin
UPDATE users SET role = 'superadmin' WHERE username = 'admin';
