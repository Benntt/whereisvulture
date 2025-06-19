
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -4,
  maxZoom: 4,
  zoomControl: true
});

const imageWidth = 16384;
const imageHeight = 8192;
const bounds = [[0, 0], [1153, 2015]]; // Just use the actual numbers


L.imageOverlay('assets/GameMap.png', bounds).addTo(map);
map.setView([4096, 8192], 0); // Center of the image with default zoom




// Define icons
const redIcon = L.icon({
  iconUrl: 'assets/Vulture-major-cop.png',
  iconSize: [32, 32]
});

const whiteIcon = L.icon({
  iconUrl: 'assets/major-cop.png',
  iconSize: [32, 32]
});

// Example CoP markers
const copCoords = {
  "Crusader": [7300, 4050],
  "Nomad": [9700, 6200],
  "Fort Narith": [8100, 3000],
  "Tiger Bay": [10200, 7150],
  "YBL-1": [4200, 7500]
};


Object.entries(copCoords).forEach(([name, coord]) => {
  const icon = (name === "Crusader" || name === "Nomad") ? redIcon : whiteIcon;
  L.marker(coord, { icon }).addTo(map).bindPopup(name);
});
