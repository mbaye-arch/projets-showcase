document.addEventListener('DOMContentLoaded', () => {
    loadBoutiques();

    document.getElementById('mon-compte-link').addEventListener('click', () => {
        toggleVisibility('client-info');
        loadClientInfo();
    });

    document.getElementById('mes-commandes-link').addEventListener('click', () => {
        toggleVisibility('orders-info');
        loadOrders();
    });

    document.getElementById('mes-boutiques-link').addEventListener('click', () => {
        toggleVisibility('boutiques-list');
        loadBoutiques();
    });

    document.getElementById('mon-panier-link').addEventListener('click', () => {
        toggleVisibility('cart-info');
        loadCart();
    });
});

function loadBoutiques() {
    const boutiques = [
        { id: '1', name: 'Boutique Parisienne', address: '123 Rue de Paris' },
        { id: '2', name: 'Boutique Lyonnaise', address: '456 Rue de Lyon' },
        { id: '3', name: 'Boutique Nantaise', address: '789 Rue de Nantes' }
    ];

    const container = document.getElementById('boutiques-list');
    container.innerHTML = '';
    boutiques.forEach(boutique => {
        const boutiqueElement = `<div>
            <h3>${boutique.name}</h3>
            <p>${boutique.address}</p>
            <button onclick="alert('Ajouté aux favoris!')">Ajouter aux favoris</button>
        </div>`;
        container.innerHTML += boutiqueElement;
    });
}

function loadClientInfo() {
    const client = {
        nom: 'Dupont',
        prenom: 'Jean',
        adresse: '1 Rue Imaginaire',
        telephone: '0123456789',
        email: 'jean.dupont@example.com'
    };

    const container = document.getElementById('client-info');
    container.innerHTML = `
        <p>Nom: ${client.nom}</p>
        <p>Prénom: ${client.prenom}</p>
        <p>Adresse: ${client.adresse} <button onclick="alert('Modifier Adresse')">Modifier</button></p>
        <p>Téléphone: ${client.telephone} <button onclick="alert('Modifier Téléphone')">Modifier</button></p>
        <p>Email: ${client.email} <button onclick="alert('Modifier Email')">Modifier</button></p>
    `;
}

function loadOrders() {
    const orders = [
        { id: '101', date: '01/04/2024' },
        { id: '102', date: '15/04/2024' }
    ];

    const container = document.getElementById('orders-info');
    container.innerHTML = '';
    orders.forEach(order => {
        const orderElement = `<div>
            <p>Commande ID: ${order.id} - ${order.date}</p>
            <button onclick="alert('Commande annulée')">Annuler la commande</button>
            <button onclick="alert('PDF téléchargé')">Télécharger la commande</button>
        </div>`;
        container.innerHTML += orderElement;
    });
}

function loadCart() {
    const cart = {
        items: [
            { id: 'prod1', name: 'Produit A', price: '20€' },
            { id: 'prod2', name: 'Produit B', price: '30€' }
        ]
    };

    const container = document.getElementById('cart-info');
    container.innerHTML = '';
    cart.items.forEach(item => {
        const itemElement = `<div>
            <p>${item.name} - ${item.price}</p>
            <button onclick="alert('Produit retiré')">Supprimer</button>
        </div>`;
        container.innerHTML += itemElement;
    });
    container.innerHTML += '<button onclick="alert(\'Panier confirmé\')">Confirmer le panier</button><button onclick="alert(\'Panier supprimé\')">Supprimer le panier</button>';
}

function toggleVisibility(sectionId) {
    const sections = ['boutiques-list', 'client-info', 'orders-info', 'cart-info'];
    sections.forEach(section => {
        if (section === sectionId) {
            document.getElementById(section).style.display = 'block';
        } else {
            document.getElementById(section).style.display = 'none';
        }
    });
}

