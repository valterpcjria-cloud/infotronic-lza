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
$headers = getallheaders();
$apiKey = isset($headers['X-API-Key']) ? $headers['X-API-Key'] : (isset($_GET['api_key']) ? $_GET['api_key'] : '');

if ($apiKey !== EXPECTED_API_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Acesso não autorizado. API Key inválida.', 'success' => false]);
    exit;
}

// --- CONFIGURAÇÕES DO BANCO DE DADOS ---
// Em produção, esses valores devem ser carregados de variáveis de ambiente do servidor
$host = 'localhost';
$db   = 'meusis41_infotronic_db';
$user = 'meusis41_user';
$pass = 'SUA_SENHA_AQUI'; 
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
    echo json_encode(['error' => 'Erro de conexão interna.', 'success' => false]);
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
                $row['specs'] = json_decode($row['specs_json'] ?? '{}') ?: new stdClass();
                $row['categoryId'] = $row['category_id'];
                $row['refCode'] = $row['ref_code'];
                $row['stockQuantity'] = (int)($row['stock_quantity'] ?? 0);
                unset($row['images_json'], $row['specs_json'], $row['category_id'], $row['ref_code'], $row['stock_quantity']);
            }
            echo json_encode($results);
            exit;
        }
    }

    // POST: Criar/Atualizar Recursos (Upsert)
    if ($method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (!$data) throw new Exception("Dados de entrada inválidos.");

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
                'specs_json' => json_encode($data['specs'] ?? new stdClass())
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
    }

    http_response_code(404);
    echo json_encode(['error' => 'Recurso não encontrado', 'success' => false]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("API Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
