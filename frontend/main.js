import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';

// init map
const map = L.map('map').setView([-0.95, 100.35], 13);

// basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// marker
let startMarker = null;
let routeLine = null;
let selectedEvacuationPoint = null;
let selectedEvacuationMarker = null;

const evacuationPoints = [
  { name: "Titik Evakuasi 1", latlng: [-0.956, 100.345] },
  { name: "Titik Evakuasi 2", latlng: [-0.948, 100.362] },
  { name: "Titik Evakuasi 3", latlng: [-0.941, 100.334] }
];

const defaultEvacStyle = {
  radius: 8,
  color: '#2e7d32',
  fillColor: '#4caf50',
  fillOpacity: 0.9,
  weight: 2
};

const selectedEvacStyle = {
  radius: 9,
  color: '#0d47a1',
  fillColor: '#2196f3',
  fillOpacity: 1,
  weight: 2
};

evacuationPoints.forEach((point) => {
  const marker = L.circleMarker(point.latlng, defaultEvacStyle)
    .addTo(map)
    .bindPopup(point.name);

  marker.on('click', () => {
    if (selectedEvacuationMarker) {
      selectedEvacuationMarker.setStyle(defaultEvacStyle);
    }

    marker.setStyle(selectedEvacStyle);
    selectedEvacuationMarker = marker;
    selectedEvacuationPoint = L.latLng(point.latlng[0], point.latlng[1]);
    marker.bindPopup(`${point.name} (terpilih)`).openPopup();
  });
});

// klik map untuk titik awal
map.on('click', (e) => {
  if (startMarker) map.removeLayer(startMarker);

  startMarker = L.marker(e.latlng).addTo(map)
    .bindPopup("Titik Awal").openPopup();
});

// tombol hitung
document.getElementById("btnRoute").addEventListener("click", async () => {

  if (!startMarker || !selectedEvacuationPoint) {
    alert("Pilih titik awal dan titik evakuasi dulu!");
    return;
  }

  const speed = document.getElementById("speed").value;
  const rst = document.getElementById("rst").value;

  const payload = {
    start: startMarker.getLatLng(),
    end: selectedEvacuationPoint,
    speed: speed,
    rst: rst
  };

  try {
    const res = await fetch("http://localhost:5000/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // hapus route lama
    if (routeLine) {
      map.removeLayer(routeLine);
    }

    // gambar polyline
    routeLine = L.polyline(data.route, {
      color: "blue"
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());

    // tampilkan hasil
    document.getElementById("result").innerHTML = `
      <p>ETE: ${data.ete}</p>
      <p>Status: ${data.status}</p>
    `;

  } catch (err) {
    console.error(err);
    alert("Gagal koneksi ke backend");
  }

});