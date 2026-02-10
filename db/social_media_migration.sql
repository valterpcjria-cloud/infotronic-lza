-- Migração para suporte a Mídias Sociais nas configurações
-- Adiciona os campos 'instagram' e 'facebook' na tabela de settings

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
('instagram', ''),
('facebook', '');
