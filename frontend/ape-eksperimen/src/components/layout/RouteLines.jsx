import { Fragment } from "react";
import { Polyline, Tooltip } from "react-leaflet";

const getRouteStrokeStyle = (routeColor) => {
  const normalizedColor = String(routeColor || "").toLowerCase();

  if (normalizedColor === "orange") {
    return {
      color: "#ff2d8f",
      dashArray: "10 8",
    };
  }

  if (normalizedColor === "blue") {
    return {
      color: "#00c2ff",
      dashArray: undefined,
    };
  }

  return {
    color: routeColor || "#00c2ff",
    dashArray: undefined,
  };
};

function RouteLines({ routes = [], nodes = [], edges = [] }) {
  if (!routes.length) return null;

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.node_id, node]));

  return (
    <>
      {routes.map((route, routeIndex) => (
        <Fragment key={`route-group-${routeIndex}`}>
          {/* Layer casing gelap agar rute tetap kontras di atas garis jalan */}
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: "#111827",
              weight: 10,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />

          {/* Garis rute utama */}
          <Polyline
            positions={route.geometry}
            pathOptions={{
              ...getRouteStrokeStyle(route.color),
              weight: 5,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            }}
          />

          {/* Hover layer untuk edge */}
          {edges.map((edge, edgeIndex) => {
            const uNode = nodeMap[edge.u];
            const vNode = nodeMap[edge.v];

            if (!uNode || !vNode) return null;

            return (
              <Polyline
                key={`edge-${routeIndex}-${edgeIndex}`}
                positions={[
                  [uNode.latitude, uNode.longitude],
                  [vNode.latitude, vNode.longitude],
                ]}
                pathOptions={{
                  color: "transparent",
                  weight: 15,
                }}
              >
                <Tooltip sticky>
                  <div>
                    <div>
                      <strong>Edge</strong>
                    </div>

                    <div>U: {edge.u}</div>
                    <div>V: {edge.v}</div>
                    <div>Length: {Number(edge.length).toFixed(2)} m</div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}

export default RouteLines;
