import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "./components/layout/Sidebar";
import Simulation from "./components/layout/Simulation";
import Dataset from "./components/layout/Dataset";
import Result from "./components/layout/Result";
import Scenario from "./components/layout/Scenario";
import Departure from "./components/layout/Departure";
import MapFlyTo from "./components/layout/MapFlyTo";
import RouteLines from "./components/layout/RouteLines";

import "./App.css";

/* fix default marker icon */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* handle click leaflet */
function MapClickHandler({ mapPickTargetId, onMapSelect }) {
  useMapEvents({
    click(event) {
      if (mapPickTargetId == null) return;

      onMapSelect({
        rowId: mapPickTargetId,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function App() {
  const [mapSelection, setMapSelection] = useState(null);
  const [mapPickTargetId, setMapPickTargetId] = useState(null);
  const [routesToShow, setRoutesToShow] = useState([]);
  const [mapCenter, setMapCenter] = useState([-6.2, 106.816666]);
  const [mapZoom, setMapZoom] = useState(13);

  const [evacuationPoints, setEvacuationPoints] = useState([]);

  useEffect(() => {
    const fetchEvacuationPoints = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/nodes/evacuation_points",
        );

        const data = await response.json();

        setEvacuationPoints(data.evacuation_points || []);
      } catch (error) {
        console.error("Failed to fetch evacuation points:", error);
      }
    };

    fetchEvacuationPoints();
  }, []);

  const handleMapSelect = (data) => {
    setMapSelection(data);
    setMapPickTargetId(null);
  };

  return (
    <BrowserRouter>
      <main className="app-shell">
        <Sidebar />

        <section className="map-panel">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="leaflet-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              mapPickTargetId={mapPickTargetId}
              onMapSelect={handleMapSelect}
            />

            <MapFlyTo center={mapCenter} zoom={mapZoom} />

            <RouteLines routes={routesToShow} />

            {/* evacuation point markers */}
            {evacuationPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.latitude, point.longitude]}
              >
                <Popup>
                  <div>
                    <strong>{point.node_id}</strong>
                    <br />
                    Latitude: {point.latitude}
                    <br />
                    Longitude: {point.longitude}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>

        <Routes>
          <Route
            path="/simulation"
            element={
              <Simulation
                mapSelection={mapSelection}
                mapPickTargetId={mapPickTargetId}
                onRequestMapPick={setMapPickTargetId}
              />
            }
          />

          <Route path="/dataset" element={<Dataset />} />

          <Route path="/result" element={<Result />} />

          <Route path="/result/:scenario_id" element={<Scenario />} />

          <Route
            path="/result/:scenario_id/:departure_point_id"
            element={
              <Departure
                onShowRoutes={setRoutesToShow}
                onMapFocus={(position) => {
                  setMapCenter(position);
                  setMapZoom(15);
                }}
              />
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
