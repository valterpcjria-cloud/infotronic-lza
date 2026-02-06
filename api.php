<?php
/**
 * INFOTRONIC - API de Gestão de Inventário
 * Versão robusta com Autenticação e Gestão de Erros
 */

// --- CONFIGURAÇÕES DE SEGURANÇA ---
define('EXPECTED_API_KEY', 'infotronic_secure_key_2024_xyz'); // Deve coincidir com o .env do frontend

// Desativa exibição de erros brutos para não corromper o JSON
ini_set('display_errors', 0);
error_reporting(0);

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Limpa qualquer saída acidental anterior
if (ob_get_length()) ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- VALIDAÇÃO DE API KEY ---
function getApiKey() {
    // 1. Tentar pelos headers do Apache/Nginx
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    if (isset($headers['x-api-key'])) return $headers['x-api-key'];
    
    // 2. Tentar pelo $_SERVER (comum em FastCGI)
    if (isset($_SERVER['HTTP_X_API_KEY'])) return $_SERVER['HTTP_X_API_KEY'];
    
    // 3. Tentar via GET (como fallback)
    if (isset($_GET['api_key'])) return $_GET['api_key'];
    
    return '';
}

$apiKey = getApiKey();

// --- SERVE_IMAGE: Deve ser público e não requer autenticação ---
// Isso permite que a tag <img> do navegador acesse as imagens
$resource = $_GET['resource'] ?? '';
if ($resource === 'serve_image' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $name = basename($_GET['name'] ?? '');
    $filePath = 'uploads/' . $name;
    if ($name && file_exists($filePath)) {
        $fileType = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $contentTypes = [
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'svg'  => 'image/svg+xml',
            'bmp'  => 'image/bmp',
            'ico'  => 'image/x-icon',
            'tiff' => 'image/tiff',
            'avif' => 'image/avif'
        ];
        
        // Limpar qualquer buffer para garantir integridade binária
        while (ob_get_level()) ob_end_clean();
        
        // Remover header JSON (serve_image retorna binário)
        header_remove('Content-Type');
        header('Content-Type: ' . ($contentTypes[$fileType] ?? 'application/octet-stream'));
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: public, max-age=86400'); // Cache de 24h
        readfile($filePath);
    } else {
        http_response_code(404);
        echo "Imagem não encontrada.";
    }
    exit;
}

// --- VALIDAÇÃO DE API KEY (agora APÓS serve_image) ---
if ($apiKey !== EXPECTED_API_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Acesso não autorizado. API Key inválida.', 'success' => false, 'debug_received' => substr($apiKey, 0, 3) . '...']);
    exit;
}

// --- CONFIGURAÇÕES DO BANCO DE DADOS ---
// IMPORTANTE: Insira suas credenciais reais abaixo para conectar ao MySQL
$host = 'localhost';
$db   = 'infotronic'; // Altere se o nome do banco na HostGator for diferente
$user = 'meusis41_user';
$pass = 'SUA_SENHA_AQUI'; // <--- COLOQUE A SENHA DO BANCO AQUI
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    error_log("DB Connection Error: " . $e->getMessage());
    echo json_encode(['error' => 'Erro de conexão interna: ' . $e->getMessage(), 'success' => false]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$resource = isset($_GET['resource']) ? $_GET['resource'] : '';

try {
    // GET: Buscar Recursos
    if ($method === 'GET') {
        if ($resource === 'categories') {
            $stmt = $pdo->query("SELECT * FROM categories");
            $data = $stmt->fetchAll() ?: [];
            echo json_encode($data);
            exit;
        } elseif ($resource === 'products') {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            $results = $stmt->fetchAll() ?: [];
            
            foreach ($results as &$row) {
                $row['images'] = json_decode($row['images_json'] ?? '[]') ?: [];
                $jsonSpecs = json_decode($row['specs_json'] ?? '{}');
                $row['specs'] = (is_object($jsonSpecs) || is_array($jsonSpecs)) ? $jsonSpecs : new stdClass();
                // Ensure empty array becomes object (stdClass) for JSON output
                if (is_array($row['specs']) && empty($row['specs'])) $row['specs'] = new stdClass();
                
                $row['categoryId'] = $row['category_id'];
                $row['refCode'] = $row['ref_code'];
                $row['stockQuantity'] = (int)($row['stock_quantity'] ?? 0);
                unset($row['images_json'], $row['specs_json'], $row['category_id'], $row['ref_code'], $row['stock_quantity']);
            }
            echo json_encode($results);
            exit;
        } elseif ($resource === 'serve_image') {
            $name = basename($_GET['name'] ?? '');
            $filePath = 'uploads/' . $name;
            if ($name && file_exists($filePath)) {
                $fileType = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                $contentTypes = [
                    'png'  => 'image/png',
                    'jpg'  => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'gif'  => 'image/gif',
                    'webp' => 'image/webp',
                    'svg'  => 'image/svg+xml',
                    'bmp'  => 'image/bmp',
                    'ico'  => 'image/x-icon',
                    'tiff' => 'image/tiff'
                ];
                
                // Limpar qualquer buffer para garantir integridade binária
                while (ob_get_level()) ob_end_clean();
                
                header('Content-Type: ' . ($contentTypes[$fileType] ?? 'application/octet-stream'));
                header('Content-Length: ' . filesize($filePath));
                header('Cache-Control: public, max-age=86400'); // Cache de 24h
                readfile($filePath);
            } else {
                http_response_code(404);
                echo "Imagem não encontrada.";
            }
            exit;
        }
    }

    // POST: Criar/Atualizar Recursos (Upsert)
    if ($method === 'POST') {
        if ($resource === 'upload') {
            if (!isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Nenhum arquivo enviado ou limite do servidor excedido.', 'success' => false]);
                exit;
            }

            $file = $_FILES['file'];
            
            // Verificar erros de upload do PHP
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE   => 'O arquivo excede o limite (upload_max_filesize) do servidor.',
                    UPLOAD_ERR_FORM_SIZE  => 'O arquivo excede o limite do formulário.',
                    UPLOAD_ERR_PARTIAL    => 'O upload foi feito apenas parcialmente.',
                    UPLOAD_ERR_NO_FILE    => 'Nenhum arquivo foi enviado.',
                    UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente no servidor.',
                    UPLOAD_ERR_CANT_WRITE => 'Falha ao gravar arquivo no disco.',
                    UPLOAD_ERR_EXTENSION  => 'Uma extensão do PHP interrompeu o upload.',
                ];
                $msg = $errorMessages[$file['error']] ?? 'Erro técnico desconhecido no upload.';
                echo json_encode(['error' => $msg, 'success' => false]);
                exit;
            }

            $targetDir = "uploads/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }

            // Sanitizar nome do arquivo e adicionar timestamp para evitar conflitos
            $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", basename($file["name"]));
            $targetFilePath = $targetDir . $fileName;
            $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

            // Validar extensões (Expandido conforme pedido do usuário)
            $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif');
            if (in_array($fileType, $allowTypes)) {
                if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
                    echo json_encode([
                        'success' => true, 
                        'url' => 'api.php?resource=serve_image&name=' . $fileName,
                        'fileName' => $fileName
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Erro ao salvar o arquivo na pasta uploads/. Verifique permissões.', 'success' => false]);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Formato não permitido (apenas JPG, PNG, GIF, WEBP, SVG).', 'success' => false]);
            }
            exit;
        }

        // Para os demais recursos (products, categories, login), processamos como JSON
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados de entrada inválidos ou JSON malformado.', 'success' => false]);
            exit;
        }

        if ($resource === 'products') {
            $sql = "REPLACE INTO products (id, name, ref_code, description, price, stock_quantity, category_id, images_json, specs_json) 
                    VALUES (:id, :name, :ref_code, :description, :price, :stock_quantity, :category_id, :images_json, :specs_json)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $data['id'],
                'name' => $data['name'],
                'ref_code' => $data['refCode'] ?? '',
                'description' => $data['description'] ?? '',
                'price' => (float)($data['price'] ?? 0),
                'stock_quantity' => (int)($data['stockQuantity'] ?? 0),
                'category_id' => $data['categoryId'],
                'images_json' => json_encode($data['images'] ?? []),
                'specs_json' => json_encode(!empty($data['specs']) ? $data['specs'] : new stdClass())
            ]);
            echo json_encode(['success' => true]);
            exit;
        }
        
        if ($resource === 'categories') {
            $sql = "REPLACE INTO categories (id, name, icon) VALUES (:id, :name, :icon)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $data['id'],
                'name' => $data['name'],
                'icon' => $data['icon'] ?? 'Box'
            ]);
            echo json_encode(['success' => true]);
            exit;
        }

        if ($resource === 'login') {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';

            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                echo json_encode([
                    'success' => true, 
                    'user' => [
                        'id' => $user['id'], 
                        'username' => $user['username'],
                        'name' => $user['name']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Credenciais inválidas.', 'success' => false]);
            }
            exit;
        }

        if ($resource === 'settings') {
            try {
                $pdo->beginTransaction();
                $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value = :value2");
                
                foreach ($data as $key => $value) {
                    $stmt->execute(['key' => $key, 'value' => $value, 'value2' => $value]);
                }
                
                $pdo->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao salvar configurações: ' . $e->getMessage(), 'success' => false]);
            }
            exit;
        }
    }

    // DELETE: Remover Recursos
    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? $_GET['id'] : '';
        if ($resource === 'products' && $id) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            exit;
        }
        if ($resource === 'categories' && $id) {
            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    // --- SETTINGS ENDPOINTS ---
    if ($resource === 'settings') {
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
            $rows = $stmt->fetchAll();
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            echo json_encode($settings);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(['error' => 'Recurso não encontrado', 'success' => false]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("API Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
