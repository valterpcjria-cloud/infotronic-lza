
-- Criação do Banco de Dados com a nomenclatura do cPanel
CREATE DATABASE IF NOT EXISTS meusis41_infotronic_db;
USE meusis41_infotronic_db;

-- Criação da Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon TEXT -- Alterado para TEXT para suportar URLs longas ou Base64 de uploads
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criação da Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ref_code VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    category_id VARCHAR(50),
    images_json LONGTEXT, 
    specs_json TEXT,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção de Dados Iniciais de Categorias (Exemplos com URLs ou placeholders)
INSERT IGNORE INTO categories (id, name, icon) VALUES 
('1', 'Informática', 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png'),
('2', 'Segurança Eletrônica', 'https://cdn-icons-png.flaticon.com/512/3067/3067260.png'),
('3', 'Redes e Wi-Fi', 'https://cdn-icons-png.flaticon.com/512/3067/3067523.png'),
('4', 'Acessórios', 'https://cdn-icons-png.flaticon.com/512/3067/3067416.png');
