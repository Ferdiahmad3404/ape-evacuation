import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  Polyline,
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

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  const [mapCenter, setMapCenter] = useState([
    -0.9469268755204087, 100.35203933715822,
  ]);
  const [mapZoom, setMapZoom] = useState(13);
  const [boundaryPoints] = useState([
    "/boundary_points-SZ_r2015_m020_097_12_mw9.00_12h_ETA.csv",
    "/boundary_points-SZ_r2015_m020_097_10_mw9.00_12h_ETA.csv",
    "/boundary_points-SZ_r2015_m020_095_12_mw9.00_12h_ETA.csv",
    "/boundary_points-SZ_r2015_m020_095_10_mw9.00_12h_ETA.csv",
  ]);

  const [selectedBoundaryFile, setSelectedBoundaryFile] = useState(
    "/boundary_points-SZ_r2015_m020_097_12_mw9.00_12h_ETA.csv",
  );

  const [evacuationPoints, setEvacuationPoints] = useState([]);
  const [csvRoute, setCsvRoute] = useState([]);

  useEffect(() => {
    const fetchEvacuationPoints = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/nodes/evacuation_points",
        );

        const data = await response.json();
        setEvacuationPoints(Object.values(data));
      } catch (error) {
        console.error("Failed to fetch evacuation points:", error);
      }
    };

    fetchEvacuationPoints();
  }, []);

  useEffect(() => {
    const loadCSV = async (filePath) => {
      try {
        const response = await fetch(filePath);

        console.log("CSV status:", response.status);

        const text = await response.text();

        const lines = text.split("\n");
        const headers = lines[0].split(",");

        const lngIndex = headers.indexOf("longitude");
        const latIndex = headers.indexOf("latitude");

        const coords = lines
          .slice(1)
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const cols = line.split(",");

            return [parseFloat(cols[latIndex]), parseFloat(cols[lngIndex])];
          })
          .filter((c) => !isNaN(c[0]) && !isNaN(c[1]));

        setCsvRoute(coords);
      } catch (error) {
        console.error("CSV load error:", error);
      }
    };

    loadCSV(selectedBoundaryFile);
  }, [selectedBoundaryFile]);

  const handleMapSelect = (data) => {
    setMapSelection(data);
    setMapPickTargetId(null);
  };

  return (
    <BrowserRouter>
      <main className="app-shell">
        <Sidebar />

        <section className="map-panel">
          <div
            style={{
              padding: "10px",
              background: "#fff",
              zIndex: 1000,
            }}
          >
            <label>
              Boundary File:{" "}
              <select
                value={selectedBoundaryFile}
                onChange={(e) => setSelectedBoundaryFile(e.target.value)}
              >
                {boundaryPoints.map((file) => (
                  <option key={file} value={file}>
                    {file.replace("/", "")}
                  </option>
                ))}
              </select>
            </label>
          </div>

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

            {csvRoute.length > 0 && (
              <Polyline
                positions={csvRoute}
                pathOptions={{
                  color: "red",
                  weight: 3,
                }}
              />
            )}

            {evacuationPoints.map((point) => (
              <Marker
                key={point.node_id}
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
