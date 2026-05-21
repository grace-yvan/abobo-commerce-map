// Initialisation de la carte
var map = L.map('map').setView([5.442, -4.008], 16);

// Fond de carte CARTO (fiable et sans blocage)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    opacity: 0.85
}).addTo(map);

// Message de bienvenue
setTimeout(function() {
    L.popup()
        .setLatLng([5.442, -4.008])
        .setContent('<b>🎉 Bienvenue sur Abobo H-B TradeMap !</b><br>📍 92 commerces recensés<br>🔍 Cliquez sur les marqueurs')
        .openOn(map);
}, 800);

// Couleurs par catégorie
var categoryColors = {
    'Alimentation': '#E74C3C',
    'Loisirs': '#9B59B6',
    'Services': '#3498DB',
    'Restauration': '#F39C12',
    'Mode_Textile': '#1ABC9C',
    'Coiffure_Beaute': '#E91E63',
    'Commerce': '#2ECC71',
    'Sante': '#1E8F6B',
    'default': '#95A5A6'
};

// Icônes personnalisées
var categoryIcons = {
    'Alimentation': L.divIcon({ html: '🍔', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Loisirs': L.divIcon({ html: '🎮', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Services': L.divIcon({ html: '🔧', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Restauration': L.divIcon({ html: '🍽️', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Mode_Textile': L.divIcon({ html: '👗', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Coiffure_Beaute': L.divIcon({ html: '💇', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Commerce': L.divIcon({ html: '🏪', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] }),
    'Sante': L.divIcon({ html: '🏥', className: 'custom-icon', iconSize: [30, 30], popupAnchor: [0, -12] })
};

var currentLayer = null;
var allFeatures = [];

// Charger les données
function loadData() {
    if (typeof geojsonData !== 'undefined' && geojsonData.features) {
        allFeatures = geojsonData.features;
        displayCommerces(allFeatures);
        updateCounters(allFeatures);
    } else {
        console.log('En attente de data.js...');
        setTimeout(loadData, 500);
    }
}

// Affichage des commerces
function displayCommerces(features) {
    if (currentLayer) map.removeLayer(currentLayer);
    
    var markers = [];
    
    for (var i = 0; i < features.length; i++) {
        var coords = features[i].geometry.coordinates;
        var props = features[i].properties;
        var lat = coords[1];
        var lng = coords[0];
        var categorie = props.categorie || 'Commerce';
        var color = categoryColors[categorie] || categoryColors['default'];
        var iconHtml = categoryIcons[categorie] ? categoryIcons[categorie].options.html : '📍';
        
        var customIcon = L.divIcon({
            html: '<div style="background-color: ' + color + '; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); border: 2px solid white;">' + iconHtml + '</div>',
            className: 'custom-icon',
            iconSize: [32, 32],
            popupAnchor: [0, -15]
        });
        
        var marker = L.marker([lat, lng], { icon: customIcon });
        
        var nomCommerce = props.nom_commerce || 'Sans nom';
        
        marker.bindPopup(
            '<div style="min-width: 200px; font-family: \'Segoe UI\', sans-serif;">' +
            '<h4 style="color:#6B2D8D; margin:0 0 8px 0;">🏪 ' + nomCommerce + '</h4>' +
            '<p><strong>📂 Catégorie:</strong> ' + categorie + '</p>' +
            '<p><strong>🔢 Enquête N°:</strong> ' + (props.num_enquete || '-') + '</p>' +
            '<hr>' +
            '<a href="https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '" target="_blank" style="display:block; background-color:#6B2D8D; color:white; padding:5px; text-align:center; border-radius:20px; text-decoration:none; margin-top:5px;">🧭 Itinéraire</a>' +
            '</div>'
        );
        
        markers.push(marker);
    }
    
    currentLayer = L.layerGroup(markers).addTo(map);
    
    if (markers.length > 0) {
        var bounds = L.latLngBounds(markers.map(function(m) { return m.getLatLng(); }));
        map.fitBounds(bounds, { padding: [30, 30] });
    }
    
    updateCounters(features);
}

// Mise à jour des compteurs
function updateCounters(features) {
    var total = allFeatures.length;
    var displayed = features.length;
    var categories = {};
    
    for (var i = 0; i < allFeatures.length; i++) {
        var cat = allFeatures[i].properties.categorie || 'Commerce';
        categories[cat] = true;
    }
    var categoriesCount = Object.keys(categories).length;
    
    document.getElementById('total').innerText = total;
    document.getElementById('displayed').innerText = displayed;
    document.getElementById('categoriesCount').innerText = categoriesCount;
}

// Lancer le chargement
loadData();