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
    $stmt = $conn->prepare("INSERT INTO clients (prenom, nom, naissance, email, mdp, telephone, adresse) VALUES (:prenom, :nom, :naissance, :email, :mdp, :telephone, :adresse)");

    // Lier les paramètres aux valeurs du formulaire
    $stmt->bindParam(':prenom', $prenom);
    $stmt->bindParam(':nom', $nom);
    $stmt->bindParam(':naissance', $naissance);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':mdp', $hashed_password);
    $stmt->bindParam(':telephone', $telephone);
    $stmt->bindParam(':adresse', $adresse);

    // Récupération des valeurs du formulaire
    $prenom = $_POST['firstname'];
    $nom = $_POST['lastname'];
    $naissance = $_POST['birthdate'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $telephone = $_POST['phone'];
    $adresse = $_POST['address'];

    // Hashage du mot de passe pour la sécurité
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Exécution de la requête
    $stmt->execute();

    // Affichage d'un message d'inscription réussie
    echo "<script>alert('Inscription réussie!');</script>";

    // Redirection vers la page de connexion des clients
    header("Refresh:0; url=../conexion/login_client.html");
    exit(); // Assure que le script se termine ici pour éviter toute exécution supplémentaire

} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}

// Fermeture de la connexion
$conn = null;
?>
