-- Tabela de Configurações Globais (Key-Value Store)
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir valores padrão iniciais (caso não existam)
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('whatsapp_main', '5511999999999'),
('whatsapp_cart', '5511999999999'),
('address', 'Setor Comercial Norte, Quadra 01\nEdifício Corporate, DF'),
('cnpj', '');
