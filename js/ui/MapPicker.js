// Map Picker UI - Select real world location
import L from 'leaflet';
import { OSMMapLoader } from '../loaders/OSMMapLoader.js';

export class MapPicker {
    constructor(onMapSelected) {
        this.onMapSelected = onMapSelected;
        this.osmLoader = new OSMMapLoader();
        this.map = null;
        this.marker = null;
        this.modal = null;
        this.selectedLocation = null;
        
        this.createModal();
    }
    
    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = 'map-picker-modal';
        this.modal.className = 'map-picker-modal hidden';
        this.modal.innerHTML = `
            <div class="map-picker-content">
                <div class="map-picker-header">
                    <h2>Where do you want to start?</h2>
                    <button class="map-picker-close">&times;</button>
                </div>
                <div class="map-picker-instructions">
                    Click anywhere on the map to spawn your truck!
                </div>
                <div id="map-container"></div>
                <div class="map-picker-controls simple-mode">
                    <div class="map-picker-search">
                        <input type="text" id="location-search" placeholder="Search city, street, or place...">
                        <button id="search-btn">Search</button>
                    </div>
                    <!-- Hidden advanced options -->
                    <div class="advanced-options hidden">
                        <div class="map-picker-radius">
                            <label>Area size: <span id="radius-value">2.0km</span></label>
                            <input type="range" id="radius-slider" min="200" max="5000" value="2000" step="100">
                        </div>
                        <div class="map-picker-mode">
                            <label class="mode-toggle">
                                <input type="checkbox" id="free-roam-check" checked>
                                <span>🚛 FREE ROAM MODE</span>
                            </label>
                        </div>
                    </div>
                    <div class="map-picker-buttons" style="display:none">
                        <button id="load-location-btn" class="btn btn-primary" disabled>Load Map</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Add event listeners
        this.modal.querySelector('.map-picker-close').addEventListener('click', () => this.hide());
        // this.modal.querySelector('#cancel-map-btn').addEventListener('click', () => this.hide());
        // this.modal.querySelector('#load-location-btn').addEventListener('click', () => this.loadSelectedLocation());
        this.modal.querySelector('#search-btn').addEventListener('click', () => this.searchLocation());
        this.modal.querySelector('#location-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchLocation();
        });
    }
    
    show() {
        this.modal.classList.remove('hidden');
        
        // Initialize map if not already done
        if (!this.map) {
            setTimeout(() => this.initMap(), 100);
        }
    }
    
    hide() {
        this.modal.classList.add('hidden');
    }
    
    initMap() {
        const container = this.modal.querySelector('#map-container');
        
        // Create Leaflet map
        this.map = L.map(container).setView([40.7128, -74.0060], 15);  // NYC default
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);
        
        // Click handler
        this.map.on('click', (e) => this.onMapClick(e));
        
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.map.setView([pos.coords.latitude, pos.coords.longitude], 17);
                },
                () => {} // Ignore error, keep default
            );
        }
    }
    
    onMapClick(e) {
        const { lat, lng } = e.latlng;
        this.selectedLocation = { lat, lon: lng };
        
        // Remove existing marker
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        
        // Create marker with "START HERE" popup
        this.marker = L.marker([lat, lng]).addTo(this.map);
        
        const popupContent = document.createElement('div');
        popupContent.className = 'map-popup-content';
        popupContent.innerHTML = `
            <div style="text-align:center">
                <p style="margin:0 0 8px 0; font-weight:bold">Spawn Here?</p>
                <button class="popup-start-btn" style="
                    background: #22c55e; 
                    color: white; 
                    border: none; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-weight: bold;
                ">START DRIVING 🚛</button>
            </div>
        `;
        
        // Attach listener BEFORE binding popup (robust method)
        const btn = popupContent.querySelector('.popup-start-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click
            this.loadSelectedLocation();
        });
        
        this.marker.bindPopup(popupContent).openPopup();
        
        // Draw radius circle (default 2km)
        const radius = 2000;
        if (this.circle) {
            this.circle.setLatLng([lat, lng]);
            this.circle.setRadius(radius);
        } else {
            this.circle = L.circle([lat, lng], {
                radius: radius,
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.1
            }).addTo(this.map);
        }
    }
    
    async searchLocation() {
        const query = this.modal.querySelector('#location-search').value;
        if (!query) return;
        
        try {
            // Use Nominatim for geocoding (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const results = await response.json();
            
            if (results.length > 0) {
                const { lat, lon } = results[0];
                this.map.setView([parseFloat(lat), parseFloat(lon)], 17);
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed');
        }
    }
    
    async loadSelectedLocation() {
        if (!this.selectedLocation) return;
        
        // Change button text to indicate loading
        const btn = document.querySelector('.popup-start-btn');
        if (btn) {
            btn.textContent = 'LOADING...';
            btn.disabled = true;
        }
        
        try {
            // Default settings for "Start Here" mode
            const radius = 2000;
            const freeRoam = true;
            
            const levelData = await this.osmLoader.loadArea(
                this.selectedLocation.lat,
                this.selectedLocation.lon,
                radius,
                freeRoam
            );
            
            this.hide();
            this.onMapSelected(levelData);
            
        } catch (error) {
            console.error('Failed to load map:', error);
            alert('Failed to load map data: ' + error.message);
            if (btn) {
                btn.textContent = 'START DRIVING 🚛';
                btn.disabled = false;
            }
        }
    }
}

