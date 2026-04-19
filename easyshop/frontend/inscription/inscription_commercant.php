<?php
// Parametres de connexion. Voir .env.example pour une configuration locale.
$servername = getenv('EASYSHOP_DB_HOST') ?: '127.0.0.1';
$username = getenv('EASYSHOP_DB_USER') ?: 'easyshop_user';
$password = getenv('EASYSHOP_DB_PASSWORD') ?: 'change_me_locally';
$dbname = getenv('EASYSHOP_DB_NAME') ?: 'easyshop';

try {
    // Création de la connexion
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Définir le mode d'erreur de PDO sur Exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Préparation de la requête SQL pour insérer les données
    $stmt = $conn->prepare("INSERT INTO commercants (nom_ent, adresse_ent, email_ent, mdp, numero_ent, date_ent, type, nom_proprio, naissance, adresse_proprio, lieu, description, ninea, image) VALUES (:nom_ent, :adresse_ent, :email_ent, :mdp, :numero_ent, :date_ent, :type, :nom_proprio, :naissance, :adresse_proprio, :lieu, :description, :ninea, :image)");

    // Liaison des paramètres et hachage du mot de passe
    $stmt->bindParam(':nom_ent', $_POST['company-name']);
    $stmt->bindParam(':adresse_ent', $_POST['company-address']);
    $stmt->bindParam(':email_ent', $_POST['company-email']);
    $hashed_password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $stmt->bindParam(':mdp', $hashed_password);
    $stmt->bindParam(':numero_ent', $_POST['company-number']);
    $stmt->bindParam(':date_ent', $_POST['creation-date']);
    $stmt->bindParam(':type', $_POST['business-type']);
    $stmt->bindParam(':nom_proprio', $_POST['owner-fullname']);
    $stmt->bindParam(':naissance', $_POST['owner-birthdate']);
    $stmt->bindParam(':adresse_proprio', $_POST['owner-address']);
    $stmt->bindParam(':lieu', $_POST['owner-birthplace']);
    $stmt->bindParam(':description', $_POST['description-entreprise']);
    $stmt->bindParam(':ninea', $_POST['commerce-number']);
    $image_path = $_FILES['company-image']['tmp_name'];
    $image = file_get_contents($image_path);

    // Récupérer le nom de l'entreprise pour nommer le fichier
    $company_name = $_POST['company-name'];

    // Chemin où le fichier sera enregistré
    $upload_directory = "uploads/";

    // Nom du fichier
    $file_name = $upload_directory . $company_name . '_' . basename($_FILES["company-image"]["name"]);

    // Déplacer le fichier téléchargé vers le dossier uploads
    move_uploaded_file($_FILES["company-image"]["tmp_name"], $file_name);

    // Lier le chemin du fichier dans la base de données
    $stmt->bindParam(':image', $file_name);

    // Exécution de la requête
    $stmt->execute();

    // Message de confirmation
    echo "<script>alert('Inscription validée !');</script>";

    // Redirection vers la page de connexion des commerçants
    header("Refresh:0; url=../conexion/login_commercant.html");

} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}

// Fermeture de la connexion
$conn = null;
?>
