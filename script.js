// Initialisation de la carte
var map = L.map('map').setView([5.442, -4.008], 16);

// Fond de carte
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
}).addTo(map);

// Message de bienvenue
setTimeout(function() {
    L.popup()
        .setLatLng([5.442, -4.008])
        .setContent('<b>🎉 Carte chargée !</b><br>Test réussi.')
        .openOn(map);
}, 500);

// Test des compteurs
document.getElementById('total').innerText = '92';
document.getElementById('categoriesCount').innerText = '8';
document.getElementById('displayed').innerText = '92';
