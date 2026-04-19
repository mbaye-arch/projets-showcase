<?php
// Parametres de connexion. Voir .env.example pour une configuration locale.
$servername = getenv('EASYSHOP_DB_HOST') ?: '127.0.0.1';
$username = getenv('EASYSHOP_DB_USER') ?: 'easyshop_user';
$password = getenv('EASYSHOP_DB_PASSWORD') ?: 'change_me_locally';
$dbname = getenv('EASYSHOP_DB_NAME') ?: 'easyshop';

session_start(); // Démarrez la session

try {
    // Connexion à la base de données MySQL
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Définir le mode d'erreur de PDO sur Exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vérification des identifiants
    $numero = $_POST['numero'];
    $password = $_POST['password'];

    // Requête pour récupérer le mot de passe haché associé au numéro de livreur fourni
    $stmt = $conn->prepare("SELECT id_livreur, mdp FROM livreur WHERE numero = :numero");
    $stmt->bindParam(':numero', $numero);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // Vérifiez si le mot de passe saisi correspond au mot de passe haché stocké dans la base de données
        if (password_verify($password, $result['mdp'])) {
            // Authentification réussie
            $_SESSION['livreur_id'] = $result['id_livreur']; // Stockez l'ID du livreur dans la session
            echo "<script>alert('Connexion réussie!');</script>";
            // Redirection vers la page de connexion des clients
            header("Refresh:0; url=../espace livreur/page_livreur.html");
            exit();
        } else {
            // Mot de passe incorrect
            $_SESSION['error_message'] = "Mot de passe incorrect";
            header("Location: login_livreur.html"); // Redirigez vers la page de connexion des livreurs
            exit();
        }
    } else {
        // Numéro de livreur non trouvé
        $_SESSION['error_message'] = "Numéro de livreur non trouvé";
        header("Location: ../espace livreur/page_livreur.html"); // Redirigez vers la page de connexion des livreurs
        exit();
    }
} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}

// Fermeture de la connexion
$conn = null;
?>
