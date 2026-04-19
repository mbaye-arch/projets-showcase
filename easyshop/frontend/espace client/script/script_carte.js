document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([14.4974, -14.4524], 12); // Coordonnées pour centrer la carte sur le Sénégal

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker = L.marker([14.4974, -14.4524]).addTo(map)
        .bindPopup('Sénégal')
        .openPopup();
});

