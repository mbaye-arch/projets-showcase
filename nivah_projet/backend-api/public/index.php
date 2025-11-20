<?php
/**
 * Nivah API - Router complet avec TOUS les endpoints
 * Backend PHP simple sans framework
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Gestion des erreurs
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Charger les classes
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/JWT.php';

// Charger la configuration
Config::load();

// Obtenir la méthode HTTP et le chemin
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Enlever /backend-api/ ou /api/ du début si présent
$path = preg_replace('/^\/(backend-api|api)/', '', $path);

// Router
try {
    // ========================================
    // ROUTES PUBLIQUES (Sans authentification)
    // ========================================

    // === AUTHENTIFICATION ===

    if ($method === 'POST' && $path === '/auth/register') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->register();
    }

    if ($method === 'POST' && $path === '/auth/login') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->login();
    }

    if ($method === 'POST' && $path === '/auth/forgot-password') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->forgotPassword();
    }

    if ($method === 'POST' && $path === '/auth/verify-email') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->verifyEmail();
    }

    if ($method === 'POST' && $path === '/auth/resend-verification') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->resendVerification();
    }

    if ($method === 'POST' && $path === '/auth/reset-password') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->resetPassword();
    }

    // === BOUTIQUES ===

    if ($method === 'GET' && $path === '/boutiques') {
        require_once __DIR__ . '/../controllers/BoutiqueController.php';
        (new BoutiqueController())->index();
    }

    if ($method === 'GET' && $path === '/boutiques/featured') {
        require_once __DIR__ . '/../controllers/BoutiqueController.php';
        (new BoutiqueController())->featured();
    }

    if ($method === 'GET' && preg_match('#^/boutiques/([a-z0-9\-]+)/produits$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/BoutiqueController.php';
        (new BoutiqueController())->produits($m[1]);
    }

    if ($method === 'GET' && preg_match('#^/boutiques/([a-z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/BoutiqueController.php';
        (new BoutiqueController())->show($m[1]);
    }

    // === PRODUITS ===

    if ($method === 'GET' && $path === '/produits/nouveautes') {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->nouveautes();
    }

    if ($method === 'GET' && $path === '/produits/coups-de-coeur') {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->coupsCoeur();
    }

    if ($method === 'GET' && $path === '/produits/promotions') {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->promotions();
    }

    if ($method === 'GET' && $path === '/produits') {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->index();
    }

    if ($method === 'GET' && preg_match('#^/produits/(\d+)/similaires$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->similaires($m[1]);
    }

    if ($method === 'POST' && preg_match('#^/produits/(\d+)/vue$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->incrementVue($m[1]);
    }

    if ($method === 'GET' && preg_match('#^/produits/([a-z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/ProduitController.php';
        (new ProduitController())->show($m[1]);
    }

    // === CATEGORIES ===

    if ($method === 'GET' && $path === '/categories') {
        require_once __DIR__ . '/../controllers/CategorieController.php';
        (new CategorieController())->index();
    }

    if ($method === 'GET' && preg_match('#^/categories/(\d+)/produits$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CategorieController.php';
        (new CategorieController())->produits($m[1]);
    }

    if ($method === 'GET' && preg_match('#^/categories/(\d+)/children$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CategorieController.php';
        (new CategorieController())->children($m[1]);
    }

    if ($method === 'GET' && preg_match('#^/categories/([a-z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CategorieController.php';
        (new CategorieController())->show($m[1]);
    }

    // === MARQUES ===

    if ($method === 'GET' && $path === '/marques') {
        require_once __DIR__ . '/../controllers/MarqueController.php';
        (new MarqueController())->index();
    }

    if ($method === 'GET' && $path === '/marques/premium') {
        require_once __DIR__ . '/../controllers/MarqueController.php';
        (new MarqueController())->premium();
    }

    if ($method === 'GET' && preg_match('#^/marques/(\d+)/produits$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/MarqueController.php';
        (new MarqueController())->produits($m[1]);
    }

    if ($method === 'GET' && preg_match('#^/marques/([a-z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/MarqueController.php';
        (new MarqueController())->show($m[1]);
    }

    // ========================================
    // ROUTES PROTÉGÉES (JWT requis)
    // ========================================

    // Vérifier l'authentification
    $user = JWT::user();
    if (!$user) {
        Response::unauthorized("Token manquant ou invalide");
    }

    // === PROFIL CLIENT ===

    if ($method === 'GET' && $path === '/auth/me') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->me($user);
    }

    if ($method === 'POST' && $path === '/auth/logout') {
        require_once __DIR__ . '/../controllers/AuthController.php';
        (new AuthController())->logout($user);
    }

    if ($method === 'GET' && $path === '/client/profil') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->profil($user);
    }

    if ($method === 'PUT' && $path === '/client/profil') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->updateProfil($user);
    }

    if ($method === 'PUT' && $path === '/client/mot-de-passe') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->changePassword($user);
    }

    if ($method === 'PUT' && $path === '/client/preferences') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->updatePreferences($user);
    }

    if ($method === 'DELETE' && $path === '/client/compte') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->supprimerCompte($user);
    }

    // === ADRESSES ===

    if ($method === 'GET' && $path === '/client/adresses') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->adresses($user);
    }

    if ($method === 'POST' && $path === '/client/adresses') {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->ajouterAdresse($user);
    }

    if ($method === 'PUT' && preg_match('#^/client/adresses/(\d+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->updateAdresse($user, $m[1]);
    }

    if ($method === 'DELETE' && preg_match('#^/client/adresses/(\d+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/ClientController.php';
        (new ClientController())->supprimerAdresse($user, $m[1]);
    }

    // === PANIER ===

    if ($method === 'GET' && $path === '/panier') {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->index($user);
    }

    if ($method === 'GET' && $path === '/panier/count') {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->count($user);
    }

    if ($method === 'POST' && $path === '/panier/ajouter') {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->ajouter($user);
    }

    if ($method === 'PUT' && preg_match('#^/panier/article/(\d+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->updateQuantite($user, $m[1]);
    }

    if ($method === 'DELETE' && preg_match('#^/panier/article/(\d+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->retirerArticle($user, $m[1]);
    }

    if ($method === 'DELETE' && $path === '/panier/vider') {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->vider($user);
    }

    if ($method === 'POST' && $path === '/panier/valider') {
        require_once __DIR__ . '/../controllers/PanierController.php';
        (new PanierController())->valider($user);
    }

    // === COMMANDES ===

    if ($method === 'GET' && $path === '/commandes') {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->index($user);
    }

    if ($method === 'POST' && $path === '/commandes') {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->create($user);
    }

    if ($method === 'GET' && $path === '/commandes/statistiques') {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->statistiques($user);
    }

    if ($method === 'GET' && preg_match('#^/commandes/([A-Z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->show($user, $m[1]);
    }

    if ($method === 'PUT' && preg_match('#^/commandes/(\d+)/annuler$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->annuler($user, $m[1]);
    }

    if ($method === 'GET' && preg_match('#^/commandes/(\d+)/tracking$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->tracking($user, $m[1]);
    }

    if ($method === 'GET' && preg_match('#^/commandes/(\d+)/facture$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/CommandeController.php';
        (new CommandeController())->facture($user, $m[1]);
    }

    // === DEMANDES (Support/SAV) ===

    if ($method === 'GET' && $path === '/demandes/types') {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->types();
    }

    if ($method === 'GET' && $path === '/demandes/statistiques') {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->stats($user);
    }

    if ($method === 'GET' && $path === '/demandes') {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->index($user);
    }

    if ($method === 'POST' && $path === '/demandes') {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->create($user);
    }

    if ($method === 'GET' && preg_match('#^/demandes/([A-Z0-9\-]+)$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->show($user, $m[1]);
    }

    if ($method === 'PUT' && preg_match('#^/demandes/(\d+)/annuler$#', $path, $m)) {
        require_once __DIR__ . '/../controllers/DemandeController.php';
        (new DemandeController())->cancel($user, $m[1]);
    }

    // Route non trouvée
    Response::notFound("Route $method $path non trouvée");

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());

    if (Config::isDebug()) {
        Response::serverError($e->getMessage());
    } else {
        Response::serverError("Une erreur est survenue");
    }
}
