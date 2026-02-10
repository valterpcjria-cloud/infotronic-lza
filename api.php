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

// Fallback para getallheaders em servidores Nginx/FastCGI
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

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
// IMPORTANT: Estas credenciais devem ser fornecidas pelo provedor de hospedagem (HostGator/CPainel)
$host = 'localhost';
$db   = 'meusis41_infotronic_db'; // Nome do banco conforme .env
$user = 'meusis41_user';
$pass = 'SUA_SENHA_AQUI'; // <--- INSIRA A SENHA DO BANCO CRIADO NO CPAINEL AQUI
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    if ($pass === 'SUA_SENHA_AQUI') {
        throw new Exception("Configuração Necessária: A senha do banco de dados em 'api.php' ainda está como 'SUA_SENHA_AQUI'. Por favor, edite o arquivo api.php no servidor e insira a senha real.");
    }
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("DB Connection Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
    exit;
}

// Auxiliar para verificar se uma coluna existe (evita erro se o usuário não rodou o SQL)
function columnExists($pdo, $table, $column) {
    try {
        $rs = $pdo->query("SELECT * FROM $table LIMIT 1");
        for ($i = 0; $i < $rs->columnCount(); $i++) {
            $col = $rs->getColumnMeta($i);
            if ($col['name'] === $column) return true;
        }
    } catch (Exception $e) {}
    return false;
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
        } elseif ($resource === 'users') {
            // Pegar informações do solicitante
            $headers = array_change_key_case(getallheaders(), CASE_LOWER);
            $requesterId = $headers['x-requester-id'] ?? $_SERVER['HTTP_X_REQUESTER_ID'] ?? '';
            $requesterRole = $headers['x-requester-role'] ?? $_SERVER['HTTP_X_REQUESTER_ROLE'] ?? 'staff';

            $hasCreatedBy = columnExists($pdo, 'users', 'created_by');
            $cols = "id, username, name, role, is_active, created_at" . ($hasCreatedBy ? ", created_by" : "");
            $sql = "SELECT $cols FROM users";
            $where = [];
            $params = [];

            if ($requesterRole === 'admin') {
                if ($hasCreatedBy) {
                    // Admin vê a si mesmo e usuários criados por ele (que não sejam superadmins)
                    $where[] = "(id = :reqId OR (created_by = :createdBy AND role != 'superadmin'))";
                    $params['reqId'] = $requesterId;
                    $params['createdBy'] = $requesterId;
                } else {
                    // Fallback: Se não houver a coluna, Admin vê todos que não sejam superadmins
                    // Isso evita que sumam usuários novos antes de rodar o SQL
                    $where[] = "(id = :reqId OR role != 'superadmin')";
                    $params['reqId'] = $requesterId;
                }
            } elseif ($requesterRole !== 'superadmin') {
                // Staff ou outros não devem ver a lista de usuários (ou apenas a si mesmos)
                $where[] = "id = :reqId";
                $params['reqId'] = $requesterId;
            }

            if (!empty($where)) {
                $sql .= " WHERE " . implode(" AND ", $where);
            }

            $sql .= " ORDER BY name ASC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll() ?: [];

            foreach ($data as &$u) {
                $u['is_active'] = (bool)($u['is_active'] ?? true);
            }
            echo json_encode($data);
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

        if ($resource === 'users') {
            // Pegar informações do solicitante
            $headers = array_change_key_case(getallheaders(), CASE_LOWER);
            $requesterId = $headers['x-requester-id'] ?? $_SERVER['HTTP_X_REQUESTER_ID'] ?? '';
            $requesterRole = $headers['x-requester-role'] ?? $_SERVER['HTTP_X_REQUESTER_ROLE'] ?? 'staff';

            $userId = $data['id'] ?: null;
            $newRole = $data['role'] ?: 'admin';

            // Validações de Permissão
            if ($requesterRole === 'admin') {
                // Admin não pode criar ou transformar alguém em superadmin
                if ($newRole === 'superadmin') {
                    http_response_code(403);
                    echo json_encode(['error' => 'Permissão negada para atribuir nível SuperAdmin.', 'success' => false]);
                    exit;
                }

                // Se estiver atualizando, verificar se o usuário foi criado por ele ou se é ele mesmo
                if ($userId) {
                    $chk = $pdo->prepare("SELECT role, created_by FROM users WHERE id = ?");
                    $chk->execute([$userId]);
                    $target = $chk->fetch();

                    if ($target) {
                        if ($userId != $requesterId && $target['created_by'] != $requesterId) {
                            http_response_code(403);
                            echo json_encode(['error' => 'Permissão negada. Você só pode gerir usuários criados por você.', 'success' => false]);
                            exit;
                        }
                        // Admin não pode editar superadmin
                        if ($target['role'] === 'superadmin') {
                            http_response_code(403);
                            echo json_encode(['error' => 'Permissão negada. Admins não podem gerir SuperAdmins.', 'success' => false]);
                            exit;
                        }
                    }
                }
            } elseif ($requesterRole !== 'superadmin') {
                http_response_code(403);
                echo json_encode(['error' => 'Permissão insuficiente para gerir usuários.', 'success' => false]);
                exit;
            }

            // Upsert User
            $params = [
                'username' => $data['username'],
                'name' => $data['name'],
                'role' => $newRole,
                'is_active' => isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
            ];

            $passwordSql = "";
            if (!empty($data['password'])) {
                $passwordSql = ", password = :password";
                $params['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            if ($userId) {
                // UPDATE
                $sql = "UPDATE users SET username = :username, name = :name, role = :role, is_active = :is_active" . $passwordSql . " WHERE id = :id";
                $params['id'] = $userId;
            } else {
                // INSERT
                $hasCreatedBy = columnExists($pdo, 'users', 'created_by');
                if ($hasCreatedBy) {
                    $params['created_by'] = $requesterId ? (int)$requesterId : null;
                    $sql = "INSERT INTO users (username, name, role, is_active, created_by" . (!empty($data['password']) ? ", password" : "") . ") 
                            VALUES (:username, :name, :role, :is_active, :created_by" . (!empty($data['password']) ? ", :password" : "") . ")";
                } else {
                    $sql = "INSERT INTO users (username, name, role, is_active" . (!empty($data['password']) ? ", password" : "") . ") 
                            VALUES (:username, :name, :role, :is_active" . (!empty($data['password']) ? ", :password" : "") . ")";
                }
            }
            
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    throw new Exception("O usuário '" . $data['username'] . "' já existe no sistema.");
                }
                throw $e;
            }
            echo json_encode(['success' => true]);
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
                // Verificar se o usuário está ativo
                if (!($user['is_active'] ?? 1)) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Esta conta está desativada. Entre em contato com o administrador.', 'success' => false]);
                    exit;
                }

                echo json_encode([
                    'success' => true, 
                    'user' => [
                        'id' => $user['id'], 
                        'username' => $user['username'],
                        'name' => $user['name'],
                        'role' => $user['role'] ?? 'admin'
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
        if ($resource === 'users' && $id) {
            // Pegar informações do solicitante
            $headers = array_change_key_case(getallheaders(), CASE_LOWER);
            $requesterId = $headers['x-requester-id'] ?? '';
            $requesterRole = $headers['x-requester-role'] ?? 'staff';

            // Validações
            if ($requesterRole === 'admin') {
                $chk = $pdo->prepare("SELECT role, created_by FROM users WHERE id = ?");
                $chk->execute([$id]);
                $target = $chk->fetch();

                if ($target) {
                    if ($target['created_by'] != $requesterId) {
                        http_response_code(403);
                        echo json_encode(['error' => 'Permissão negada. Você só pode excluir usuários criados por você.', 'success' => false]);
                        exit;
                    }
                    if ($target['role'] === 'superadmin') {
                        http_response_code(403);
                        echo json_encode(['error' => 'Permissão negada. Admins não podem excluir SuperAdmins.', 'success' => false]);
                        exit;
                    }
                }
            } elseif ($requesterRole !== 'superadmin') {
                http_response_code(403);
                echo json_encode(['error' => 'Permissão insuficiente.', 'success' => false]);
                exit;
            }

            // Prevent deleting the last superadmin
            if ($requesterRole === 'superadmin') {
                $chkSuper = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'superadmin'")->fetchColumn();
                $targetRole = $pdo->prepare("SELECT role FROM users WHERE id = ?");
                $targetRole->execute([$id]);
                $role = $targetRole->fetchColumn();
                
                if ($role === 'superadmin' && $chkSuper <= 1) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Não é possível excluir o único SuperAdmin do sistema.', 'success' => false]);
                    exit;
                }
            }

            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
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

} catch (Throwable $e) {
    http_response_code(500);
    error_log("API Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage(), 'success' => false]);
}
