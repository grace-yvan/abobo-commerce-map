// Initialisation de la carte
var map = L.map('map').setView([5.442, -4.008], 16);

// Fond de carte
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
}).addTo(map);

// Ajout de l'échelle
L.control.scale({
    metric: true,
    imperial: false,
    position: 'bottomleft'
}).addTo(map);

// Couleurs par catégorie
var categoryColors = {
    'Alimentation': '#E74C3C',
    'Loisirs': '#9B59B6',
    'Services': '#3498DB',
    'Restauration': '#F39C12',
    'Mode_Textile': '#1ABC9C',
    'Coiffure_Beaute': '#E91E63',
    'Commerce': '#2ECC71',
    'Sante': '#1E8F6B'
};

// Icônes personnalisées par catégorie
function getIcon(categorie) {
    var color = categoryColors[categorie] || '#95A5A6';
    var icons = {
        'Alimentation': '🍔', 'Loisirs': '🎮', 'Services': '🔧',
        'Restauration': '🍽️', 'Mode_Textile': '👗', 'Coiffure_Beaute': '💇',
        'Commerce': '🏪', 'Sante': '🏥'
    };
    var emoji = icons[categorie] || '📍';
    
    return L.divIcon({
        html: '<div style="background:' + color + ';width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.2);">' + emoji + '</div>',
        iconSize: [32, 32],
        popupAnchor: [0, -15]
    });
}

var currentLayer = null;
var allFeatures = [];
var chart = null;

// Charger les données
function loadData() {
    if (typeof geojsonData !== 'undefined' && geojsonData.features) {
        allFeatures = geojsonData.features;
        displayCommerces(allFeatures);
        updateStats(allFeatures);
        updateCategories(allFeatures);
    } else {
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
        
        var marker = L.marker([lat, lng], { icon: getIcon(categorie) });
        
        var nomCommerce = props.nom_commerce || 'Sans nom';
        
        marker.bindPopup(
            '<div style="min-width: 180px;">' +
            '<h4 style="color:#6B2D8D; margin:0 0 8px 0;">🏪 ' + nomCommerce + '</h4>' +
            '<p><strong>📂 Catégorie:</strong> ' + categorie + '</p>' +
            '<p><strong>🔢 Enquête N°:</strong> ' + (props.num_enquete || '-') + '</p>' +
            '<hr>' +
            '<a href="https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '" target="_blank" style="display:block;background:#6B2D8D;color:white;padding:5px;text-align:center;border-radius:20px;text-decoration:none;margin-top:5px;">🧭 Itinéraire</a>' +
            '</div>'
        );
        
        markers.push(marker);
    }
    
    currentLayer = L.layerGroup(markers).addTo(map);
    
    if (markers.length > 0) {
        var bounds = L.latLngBounds(markers.map(function(m) { return m.getLatLng(); }));
        map.fitBounds(bounds, { padding: [30, 30] });
    }
}

// Statistiques et graphique
function updateStats(features) {
    var container = document.getElementById('stats-container');
    container.innerHTML = '';
    
    var categories = {};
    for (var i = 0; i < allFeatures.length; i++) {
        var cat = allFeatures[i].properties.categorie || 'Commerce';
        categories[cat] = (categories[cat] || 0) + 1;
    }
    
    // Total
    var totalDiv = document.createElement('div');
    totalDiv.className = 'stat-item';
    totalDiv.innerHTML = '<span>📊 Total commerces :</span><strong>' + allFeatures.length + '</strong>';
    container.appendChild(totalDiv);
    
    // Détails par catégorie
    var cats = Object.keys(categories).sort();
    for (var j = 0; j < cats.length; j++) {
        var div = document.createElement('div');
        div.className = 'stat-item';
        var color = categoryColors[cats[j]] || '#95A5A6';
        div.innerHTML = '<span><span style="color:' + color + ';">●</span> ' + cats[j] + ' :</span><strong>' + categories[cats[j]] + '</strong>';
        container.appendChild(div);
    }
    
    // Graphique camembert
    createChart(categories);
}

// Création du graphique
function createChart(categories) {
    var ctx = document.getElementById('statsChart');
    if (!ctx) return;
    
    var labels = Object.keys(categories);
    var data = Object.values(categories);
    var colors = labels.map(function(cat) { return categoryColors[cat] || '#95A5A6'; });
    
    if (chart) chart.destroy();
    
    chart = new Chart(ctx, {
        type: 'pie',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: colors }] },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } }
    });
}

// Catégories pour filtres
function updateCategories(features) {
    var container = document.getElementById('categories-list');
    container.innerHTML = '';
    
    var categories = {};
    for (var i = 0; i < allFeatures.length; i++) {
        var cat = allFeatures[i].properties.categorie || 'Commerce';
        categories[cat] = (categories[cat] || 0) + 1;
    }
    
    var cats = Object.keys(categories).sort();
    for (var j = 0; j < cats.length; j++) {
        var cat = cats[j];
        var color = categoryColors[cat] || '#95A5A6';
        var div = document.createElement('div');
        div.className = 'category-item';
        div.setAttribute('data-category', cat);
        div.innerHTML = '<div class="category-color" style="background-color: ' + color + '"></div>' +
            '<span class="category-name">' + cat + '</span>' +
            '<span class="category-count">' + categories[cat] + '</span>';
        div.onclick = (function(c) { return function() { filterByCategory(c); }; })(cat);
        container.appendChild(div);
    }
}

// Filtre par catégorie
function filterByCategory(category) {
    var items = document.querySelectorAll('.category-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        if (items[i].getAttribute('data-category') === category) items[i].classList.add('active');
    }
    
    var filtered = [];
    for (var j = 0; j < allFeatures.length; j++) {
        var cat = allFeatures[j].properties.categorie || 'Commerce';
        if (cat === category) filtered.push(allFeatures[j]);
    }
    displayCommerces(filtered);
    document.getElementById('search').value = '';
}

// Filtre par recherche
function filterBySearch(searchText) {
    if (searchText === '') {
        displayCommerces(allFeatures);
        var items = document.querySelectorAll('.category-item');
        for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
        return;
    }
    
    var searchLower = searchText.toLowerCase();
    var filtered = [];
    for (var j = 0; j < allFeatures.length; j++) {
        var nom = (allFeatures[j].properties.nom_commerce || '').toLowerCase();
        var cat = (allFeatures[j].properties.categorie || '').toLowerCase();
        if (nom.includes(searchLower) || cat.includes(searchLower)) filtered.push(allFeatures[j]);
    }
    displayCommerces(filtered);
    var items = document.querySelectorAll('.category-item');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
}

// Reset des filtres
function resetFilters() {
    displayCommerces(allFeatures);
    var items = document.querySelectorAll('.category-item');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
    document.getElementById('search').value = '';
}

// Géolocalisation
document.getElementById('locateBtn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            map.setView([lat, lng], 16);
            L.marker([lat, lng]).addTo(map)
                .bindPopup('📍 Vous êtes ici').openPopup();
        }, function() {
            alert('Géolocalisation non autorisée');
        });
    } else {
        alert('Géolocalisation non supportée par votre navigateur');
    }
});

// Mode sombre / clair
var darkModeBtn = document.getElementById('darkModeBtn');
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            darkModeBtn.innerHTML = '☀️ Mode clair';
        } else {
            darkModeBtn.innerHTML = '🌙 Mode sombre';
        }
    });
}

// Export PDF
document.getElementById('exportPDF').addEventListener('click', function() {
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Rapport Commerces Abobo</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial; margin: 20px; }');
    printWindow.document.write('h1 { color: #6B2D8D; }');
    printWindow.document.write('h2 { color: #3CB371; }');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; margin-top: 10px; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background: #6B2D8D; color: white; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>📊 Rapport des Commerces - Abobo</h1>');
    printWindow.document.write('<p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p>');
    printWindow.document.write('<p><strong>Total commerces recensés:</strong> ' + allFeatures.length + '</p>');
    printWindow.document.write('<h2>📈 Statistiques par catégorie</h2>');
    
    var categories = {};
    for (var i = 0; i < allFeatures.length; i++) {
        var cat = allFeatures[i].properties.categorie || 'Commerce';
        categories[cat] = (categories[cat] || 0) + 1;
    }
    
    printWindow.document.write('<tr>');
    printWindow.document.write('<tr><th>Catégorie</th><th>Nombre</th></tr>');
    for (var cat in categories) {
        printWindow.document.write('<tr><td>' + cat + '</td><td>' + categories[cat] + '</td></tr>');
    }
    printWindow.document.write('</table>');
    
    printWindow.document.write('<h2>🏪 Liste des commerces</h2>');
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>Nom</th><th>Catégorie</th><th>Enquête N°</th></tr>');
    for (var i = 0; i < allFeatures.length; i++) {
        var p = allFeatures[i].properties;
        printWindow.document.write('<tr><td>' + (p.nom_commerce || '-') + '</td><td>' + (p.categorie || '-') + '</td><td>' + (p.num_enquete || '-') + '</td></tr>');
    }
    printWindow.document.write('</table>');
    printWindow.document.write('<hr>');
    printWindow.document.write('<p>© 2026 - Projet PCT - Université Virtuelle de Côte d\'Ivoire (UVCI)</p>');
    printWindow.document.write('<p>KPAN MANDOH GRACE | OKOU YVAN CÉDRICK</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// Écouteurs
document.getElementById('search').addEventListener('input', function(e) {
    filterBySearch(e.target.value);
});

document.getElementById('resetFilters').addEventListener('click', resetFilters);

// Lancer
loadData();