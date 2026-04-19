<?php
// Parametres de connexion. Voir .env.example pour une configuration locale.
$servername = getenv('EASYSHOP_DB_HOST') ?: '127.0.0.1';
$username = getenv('EASYSHOP_DB_USER') ?: 'easyshop_user';
$password = getenv('EASYSHOP_DB_PASSWORD') ?: 'change_me_locally';
$dbname = getenv('EASYSHOP_DB_NAME') ?: 'easyshop';

try {
    // Connexion à la base de données MySQL
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Définir le mode d'erreur de PDO sur Exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Préparation de la requête SQL pour insérer les données
    $stmt = $conn->prepare("INSERT INTO livreur (nom_complet, naissance, lieu, Adress, numero, mdp, type, permis) VALUES (:nom_complet, :naissance, :lieu, :Adress, :numero, :mdp, :type, :permis)");

    // Lier les paramètres aux valeurs du formulaire
    $stmt->bindParam(':nom_complet', $_POST['fullname']);
    $stmt->bindParam(':naissance', $_POST['birthdate']);
    $stmt->bindParam(':lieu', $_POST['birthplace']);
    $stmt->bindParam(':Adress', $_POST['address']);
    $stmt->bindParam(':numero', $_POST['numero']);

    // Hashage du mot de passe pour la sécurité
    $hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $stmt->bindParam(':mdp', $hashed_password);

    $stmt->bindParam(':type', $_POST['vehicle-type']);
    $stmt->bindParam(':permis', $_POST['license']);

    // Exécution de la requête
    $stmt->execute();

    // Affichage d'un message de succès
    echo "<script>alert('Inscription réussie!');</script>";

    // Redirection vers la page de connexion des clients
    header("Refresh:0; url=../conexion/login_livreur.html");
    exit(); // Assure que le script se termine ici pour éviter toute exécution supplémentaire

} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}

// Fermeture de la connexion
$conn = null;
?>
