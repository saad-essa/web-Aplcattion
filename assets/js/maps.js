// Maps functionality for Socotra Go

document.addEventListener('DOMContentLoaded', function() {
    // Initialize maps
    initSocotraMap();
    initAttractionMaps();
    initOfficeMap();
});

// Initialize main Socotra map
function initSocotraMap() {
    const mapElement = document.getElementById('socotraMap');
    if (!mapElement) return;
    
    // Socotra coordinates
    const socotraLat = 12.4634;
    const socotraLng = 53.8231;
    
    // Create map
    const map = L.map('socotraMap').setView([socotraLat, socotraLng], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Attraction markers data
    const attractions = [
        {
            name: 'شاطئ عيق',
            lat: 12.5500,
            lng: 54.4167,
            type: 'beach',
            description: 'أحد أجمل شواطئ العالم برمال بيضاء ومياه فيروزية'
        },
        {
            name: 'شجرة دم الأخوين',
            lat: 12.4856,
            lng: 53.3862,
            type: 'forest',
            description: 'شجرة نادرة تنمو فقط في سقطرى'
        },
        {
            name: 'كهف حوق',
            lat: 12.5833,
            lng: 53.7833,
            type: 'cave',
            description: 'كهف أثري يحتوي على نقوش وكتابات قديمة'
        },
        {
            name: 'وادي دكسم',
            lat: 12.5000,
            lng: 53.9000,
            type: 'mountain',
            description: 'وادي جبلي خلاب يقع في وسط الجزيرة'
        },
        {
            name: 'قلنسية',
            lat: 12.6895,
            lng: 53.4871,
            type: 'beach',
            description: 'مدينة ساحلية تشتهر بشواطئها الذهبية'
        },
        {
            name: 'محمية دي حمري',
            lat: 12.6500,
            lng: 54.0167,
            type: 'protected',
            description: 'محمية بحرية طبيعية تتميز بتنوع بيولوجي فريد'
        },
        {
            name: 'شاطئ أرك',
            lat: 12.4500,
            lng: 53.2500,
            type: 'beach',
            description: 'شاطئ منعزل يتميز برمال بيضاء ناعمة'
        }
    ];
    
    // Icon colors based on type
    const iconColors = {
        'beach': 'blue',
        'forest': 'green',
        'cave': 'red',
        'mountain': 'orange',
        'protected': 'yellow'
    };
    
    // Create custom icons
    const icons = {};
    Object.keys(iconColors).forEach(type => {
        icons[type] = L.divIcon({
            html: `<div class="custom-marker" style="background-color: ${getColorHex(iconColors[type])}"></div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    });
    
    // Add markers for each attraction
    const markers = [];
    attractions.forEach(attraction => {
        const marker = L.marker([attraction.lat, attraction.lng], {
            icon: icons[attraction.type]
        }).addTo(map);
        
        // Add popup
        marker.bindPopup(`
            <div class="map-popup">
                <h6>${attraction.name}</h6>
                <p>${attraction.description}</p>
                <button class="btn btn-sm btn-primary view-attraction" 
                        data-lat="${attraction.lat}" 
                        data-lng="${attraction.lng}"
                        data-name="${attraction.name}">
                    عرض التفاصيل
                </button>
            </div>
        `);
        
        markers.push(marker);
    });
    
    // Add click handler for popup buttons
    map.on('popupopen', function(e) {
        const popup = e.popup;
        const button = popup._contentNode.querySelector('.view-attraction');
        
        if (button) {
            button.addEventListener('click', function() {
                const lat = this.getAttribute('data-lat');
                const lng = this.getAttribute('data-lng');
                const name = this.getAttribute('data-name');
                
                // Find attraction card and scroll to it
                scrollToAttraction(name);
                
                // Close popup
                map.closePopup();
            });
        }
    });
    
    // Add layer control
    const overlayMaps = {
        'الشواطئ': L.layerGroup(markers.filter(m => {
            const attraction = attractions.find(a => 
                a.lat === m.getLatLng().lat && a.lng === m.getLatLng().lng);
            return attraction && attraction.type === 'beach';
        })),
        'الغابات': L.layerGroup(markers.filter(m => {
            const attraction = attractions.find(a => 
                a.lat === m.getLatLng().lat && a.lng === m.getLatLng().lng);
            return attraction && attraction.type === 'forest';
        })),
        'الكهوف': L.layerGroup(markers.filter(m => {
            const attraction = attractions.find(a => 
                a.lat === m.getLatLng().lat && a.lng === m.getLatLng().lng);
            return attraction && attraction.type === 'cave';
        })),
        'المحميات': L.layerGroup(markers.filter(m => {
            const attraction = attractions.find(a => 
                a.lat === m.getLatLng().lat && a.lng === m.getLatLng().lng);
            return attraction && attraction.type === 'protected';
        }))
    };
    
    // Add layer control to map
    L.control.layers(null, overlayMaps, {
        collapsed: false,
        position: 'topright'
    }).addTo(map);
    
    // Fit bounds to show all markers
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
    
    return map;
}

// Initialize attraction detail maps
function initAttractionMaps() {
    const mapButtons = document.querySelectorAll('.btn-map');
    
    if (mapButtons.length === 0) return;
    
    let attractionMap = null;
    const mapModal = document.getElementById('mapModal');
    
    // Initialize map in modal
    if (mapModal) {
        const mapElement = document.getElementById('attractionMap');
        
        mapButtons.forEach(button => {
            button.addEventListener('click', function() {
                const lat = parseFloat(this.getAttribute('data-lat'));
                const lng = parseFloat(this.getAttribute('data-lng'));
                const attractionName = this.closest('.attraction-card').querySelector('.attraction-title').textContent;
                
                // Update modal title
                document.getElementById('mapModalLabel').textContent = `موقع ${attractionName} على الخريطة`;
                
                // Initialize or update map
                if (!attractionMap) {
                    attractionMap = L.map('attractionMap').setView([lat, lng], 13);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 18
                    }).addTo(attractionMap);
                } else {
                    attractionMap.setView([lat, lng], 13);
                }
                
                // Clear existing markers
                attractionMap.eachLayer(function(layer) {
                    if (layer instanceof L.Marker) {
                        attractionMap.removeLayer(layer);
                    }
                });
                
                // Add marker for this attraction
                L.marker([lat, lng]).addTo(attractionMap)
                    .bindPopup(`<strong>${attractionName}</strong>`)
                    .openPopup();
                
                // Add circle for area
                L.circle([lat, lng], {
                    color: 'blue',
                    fillColor: '#30f',
                    fillOpacity: 0.1,
                    radius: 5000
                }).addTo(attractionMap);
                
                // Show modal
                const bsModal = new bootstrap.Modal(mapModal);
                bsModal.show();
            });
        });
        
        // Reset map when modal is hidden
        mapModal.addEventListener('hidden.bs.modal', function() {
            if (attractionMap) {
                attractionMap.remove();
                attractionMap = null;
            }
        });
    }
}

// Initialize office location map
function initOfficeMap() {
    const mapElement = document.getElementById('officeMap');
    const showMapButton = document.getElementById('showMap');
    
    if (!mapElement) return;
    
    // Office coordinates (Hadibo, Socotra)
    const officeLat = 12.6508;
    const officeLng = 53.9823;
    
    // Create map
    const officeMap = L.map('officeMap').setView([officeLat, officeLng], 15);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(officeMap);
    
    // Add marker for office
    L.marker([officeLat, officeLng]).addTo(officeMap)
        .bindPopup(`
            <div class="office-popup">
                <h6>مكتب Socotra Go</h6>
                <p>شارع المطار، حديبو</p>
                <p>جزيرة سقطرى، اليمن</p>
                <p><i class="bi bi-telephone"></i> +967 123 456 789</p>
            </div>
        `)
        .openPopup();
    
    // Add circle for office area
    L.circle([officeLat, officeLng], {
        color: '#2c3e50',
        fillColor: '#3498db',
        fillOpacity: 0.1,
        radius: 200
    }).addTo(officeMap);
    
    // Show map button functionality
    if (showMapButton) {
        showMapButton.addEventListener('click', function() {
            // Scroll to map section
            const mapSection = document.querySelector('.map-section');
            if (mapSection) {
                mapSection.scrollIntoView({ behavior: 'smooth' });
                
                // Highlight map
                mapElement.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.5)';
                setTimeout(() => {
                    mapElement.style.boxShadow = 'none';
                }, 2000);
            }
        });
    }
    
    return officeMap;
}

// Scroll to attraction card
function scrollToAttraction(attractionName) {
    const attractionCards = document.querySelectorAll('.attraction-card');
    
    attractionCards.forEach(card => {
        const title = card.querySelector('.attraction-title').textContent;
        if (title === attractionName) {
            card.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // Highlight card
            card.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.5)';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 2000);
        }
    });
}

// Get color hex code
function getColorHex(colorName) {
    const colors = {
        'blue': '#3498db',
        'green': '#27ae60',
        'red': '#e74c3c',
        'orange': '#f39c12',
        'yellow': '#f1c40f',
        'purple': '#9b59b6',
        'black': '#2c3e50'
    };
    
    return colors[colorName] || '#3498db';
}

// Calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Get current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Calculate route between two points
function calculateRoute(startLat, startLng, endLat, endLng) {
    // In a real implementation, this would use a routing service like OSRM or Google Maps
    // For now, we'll return a straight line
    return [
        [startLat, startLng],
        [endLat, endLng]
    ];
}

// Add route to map
function addRouteToMap(map, route, color = 'blue') {
    const polyline = L.polyline(route, {
        color: color,
        weight: 3,
        opacity: 0.7,
        smoothFactor: 1
    }).addTo(map);
    
    // Add start and end markers
    L.marker(route[0]).addTo(map)
        .bindPopup('نقطة البداية');
    
    L.marker(route[route.length - 1]).addTo(map)
        .bindPopup('نقطة النهاية');
    
    return polyline;
}

// Get directions text
function getDirections(from, to) {
    // This would integrate with a directions API
    return `اتجه من ${from} إلى ${to}`;
}

// Export functions for use in other modules
window.mapsModule = {
    initSocotraMap,
    initAttractionMaps,
    initOfficeMap,
    calculateDistance,
    getCurrentLocation,
    calculateRoute,
    addRouteToMap,
    getDirections
};

// Add custom styles for map markers
const mapStyles = document.createElement('style');
mapStyles.textContent = `
    .custom-marker {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #3498db;
        position: relative;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    
    .custom-marker:after {
        content: '';
        width: 14px;
        height: 14px;
        margin: 8px 0 0 8px;
        background: white;
        position: absolute;
        border-radius: 50%;
    }
    
    .custom-div-icon {
        background: transparent;
        border: none;
    }
    
    .map-popup {
        min-width: 200px;
    }
    
    .map-popup h6 {
        margin: 0 0 10px 0;
        color: #2c3e50;
    }
    
    .map-popup p {
        margin: 0 0 10px 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    .office-popup {
        min-width: 200px;
    }
    
    .office-popup h6 {
        margin: 0 0 5px 0;
        color: #2c3e50;
    }
    
    .office-popup p {
        margin: 5px 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    .office-popup i {
        margin-left: 5px;
        color: #3498db;
    }
    
    .leaflet-popup-content {
        margin: 13px 19px;
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .leaflet-popup-tip {
        background: white;
        box-shadow: 0 3px 14px rgba(0,0,0,0.4);
    }
    
    /* Responsive map styles */
    @media (max-width: 768px) {
        #socotraMap,
        #officeMap,
        #attractionMap {
            height: 300px !important;
        }
        
        .leaflet-control-layers {
            font-size: 0.8rem;
        }
    }
`;
document.head.appendChild(mapStyles);