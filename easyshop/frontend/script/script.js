console.log('Script loaded!');

// Add event listener for the login form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevents the form from submitting normally
    var userType = document.getElementById('user-type').value; // Get the selected user type

    // Redirect based on user type
    switch(userType) {
        case 'client':
            window.location.href = 'conexion/login_client.html';
            break;
        case 'commercant':
            window.location.href = 'conexion/login_commercant.html';
            break;
        case 'livreur':
            window.location.href = 'conexion/login_livreur.html';
            break;
        default:
            console.error('Type utilisateur non reconnu'); // Error handling
    }
});

// Add event listener for the registration form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevents the form from submitting normally
    var userType = document.getElementById('user-type-register').value; // Get the selected user type

    // Redirect based on user type
    switch(userType) {
        case 'client':
            window.location.href = 'inscription/register_client.html';
            break;
        case 'commercant':
            window.location.href = 'inscription/register_commercant.html';
            break;
        case 'livreur':
            window.location.href = 'inscription/register_livreur.html';
            break;
        default:
            console.error('Type utilisateur non reconnu'); // Error handling
    }
});

// Event handler for toggling between login and registration sections
document.getElementById('inscription-section-toggle').addEventListener('click', function() {
    document.getElementById('connexion-section').style.display = 'none'; // Hide login section
    document.getElementById('inscription-section').style.display = 'block'; // Show registration section
});

