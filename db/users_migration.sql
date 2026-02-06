
-- Selecione o banco de dados antes de rodar (Exemplo: infotronic ou meusis41_infotronic_db)
-- USE infotronic; 

-- Tabela de Usuários Administrativos
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Armazenar hash (bcrypt)
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário inicial (Senha padrão: admin123 - Recomendado trocar no primeiro acesso)
-- A senha abaixo é o hash de 'admin123' usando password_hash() do PHP
INSERT IGNORE INTO users (username, password, name) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Infotronic');
