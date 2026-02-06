
-- Selecione o banco de dados antes de rodar
-- USE infotronic;

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY, -- Pode ser numérico ou string (ex: '1', 'c1')
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(255) DEFAULT 'Box', -- Caminho da imagem ou nome do ícone
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Produtos (Atualizada com campos JSON e specs)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    category_id VARCHAR(50),
    images_json JSON, -- Armazena array de URLs: ["url1", "url2"]
    specs_json JSON,  -- Armazena objeto de specs: {"Cor": "Azul", "Peso": "1kg"}
    ref_code VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comandos para atualizar tabelas existentes (caso já existam sem os novos campos)
-- Rode estes comandos apenas se a tabela já existir e estiver desatualizada

-- Comandos para atualizar tabelas existentes
-- Execute estas linhas se você já tem a tabela products criada e quer adicionar os novos campos.
-- Se algum campo já existir, o banco retornará um erro dizendo que a coluna existe (pode ignorar).
ALTER TABLE products ADD COLUMN images_json JSON;
ALTER TABLE products ADD COLUMN specs_json JSON;
ALTER TABLE products ADD COLUMN ref_code VARCHAR(50);
ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0;
