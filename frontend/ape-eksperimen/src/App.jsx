import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  Tooltip,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "./components/layout/Sidebar";
import Simulation from "./components/layout/Simulation";
import Dataset from "./components/layout/Dataset";
import Result from "./components/layout/Result";
import Scenario from "./components/layout/Scenario";
import Departure from "./components/layout/Departure";
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
  const departureIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  const [mapSelection, setMapSelection] = useState(null);
  const [mapPickTargetId, setMapPickTargetId] = useState(null);
  const [routesToShow, setRoutesToShow] = useState([]);
  const [mapBackground, setMapBackground] = useState("map");
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
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);
  const [csvRoute, setCsvRoute] = useState([]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const isGraphBackground =
    mapBackground === "graph" || mapBackground === "both";
  const showTileBackground =
    mapBackground === "map" || mapBackground === "both";

  const getNodeColor = (node, index) => {
    if (index === 0) {
      return "#22c55e";
    }

    if (node.status === "evacuation_point") {
      return "#2563eb";
    }

    if (node.status === "inundation") {
      return "#f59e0b";
    }

    return "#ef4444";
  };

  const getGraphNodeBorderColor = (node) => {
    if (node.status === "evacuation_point") {
      return "#0f766e";
    }

    if (node.status === "inundation") {
      return "#b45309";
    }

    return "#7c3aed";
  };

  const getGraphNodeFillColor = (node) => {
    if (node.status === "evacuation_point") {
      return "#14b8a6";
    }

    if (node.status === "inundation") {
      return "#f59e0b";
    }

    return "#a78bfa";
  };

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
    const fetchGraphNodes = async () => {
      if (!isGraphBackground) {
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/nodes");
        const data = await response.json();

        setGraphNodes(Object.values(data));
      } catch (error) {
        console.error("Failed to fetch graph nodes:", error);
      }
    };

    fetchGraphNodes();
  }, [isGraphBackground]);

  useEffect(() => {
    const fetchGraphEdges = async () => {
      if (!isGraphBackground) {
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/edges");
        const data = await response.json();

        setGraphEdges(Object.values(data));
      } catch (error) {
        console.error("Failed to fetch graph edges:", error);
      }
    };

    fetchGraphEdges();
  }, [isGraphBackground]);

  useEffect(() => {
    const loadCSV = async (filePath) => {
      try {
        const response = await fetch(filePath);

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
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              Background Map:{" "}
              <select
                value={mapBackground}
                onChange={(e) => setMapBackground(e.target.value)}
              >
                <option value="map">Map</option>
                <option value="graph">Road Network Graph</option>
                <option value="both">Both</option>
              </select>
            </label>

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
            {showTileBackground && (
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {isGraphBackground &&
              graphEdges.map((edge) => {
                const uNode = graphNodes.find(
                  (node) => node.node_id === edge.u,
                );
                const vNode = graphNodes.find(
                  (node) => node.node_id === edge.v,
                );

                if (!uNode || !vNode) return null;

                return (
                  <Polyline
                    key={`graph-edge-${edge.u}-${edge.v}`}
                    positions={[
                      [uNode.latitude, uNode.longitude],
                      [vNode.latitude, vNode.longitude],
                    ]}
                    pathOptions={{
                      color: "#5b6470",
                      weight: 3,
                      opacity: 0.85,
                    }}
                  />
                );
              })}

            {isGraphBackground &&
              graphNodes.map((node) => (
                <CircleMarker
                  key={`graph-node-${node.node_id}`}
                  center={[node.latitude, node.longitude]}
                  radius={5}
                  pathOptions={{
                    color: getGraphNodeBorderColor(node),
                    fillColor: getGraphNodeFillColor(node),
                    fillOpacity: 0.9,
                    weight: 1,
                  }}
                >
                  <Tooltip>
                    <div>
                      <strong>{node.node_id}</strong>
                      <br />
                      Status: {node.status}
                      {node.name ? (
                        <>
                          <br />
                          Name: {node.name}
                        </>
                      ) : null}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

            <MapClickHandler
              mapPickTargetId={mapPickTargetId}
              onMapSelect={handleMapSelect}
            />

            <RouteLines routes={routesToShow} nodes={nodes} edges={edges} />

            {nodes.map((node, index) => {
              if (index === 0) {
                return (
                  <Marker
                    key={node.node_id}
                    position={[node.latitude, node.longitude]}
                    icon={departureIcon}
                  >
                    <Popup>
                      <div>
                        <strong>Titik Keberangkatan</strong>
                        <br />
                        Node ID: {node.node_id}
                        <br />
                        Status: {node.status}
                        {node.eta !== null && (
                          <>
                            <br />
                            RsT: {Math.round(node.eta - 8 - 10)}
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              }

              return (
                <CircleMarker
                  key={node.node_id}
                  center={[node.latitude, node.longitude]}
                  radius={5}
                  pathOptions={{
                    color: getNodeColor(node, index),
                    fillColor: getNodeColor(node, index),
                    fillOpacity: 1,
                    weight: 1,
                  }}
                >
                  <Tooltip>
                    <div>
                      <strong>{node.node_id}</strong>
                      <br />
                      Status: {node.status}
                      {node.eta !== null && (
                        <>
                          <br />
                          RsT: {Math.round(node.eta - 8 - 10)}
                        </>
                      )}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

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
                    <strong>Evacuation Point</strong>
                    <br />
                    Evacuation Point: {point.name}
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
                onSetNodes={setNodes}
                onSetEdges={setEdges}
              />
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
