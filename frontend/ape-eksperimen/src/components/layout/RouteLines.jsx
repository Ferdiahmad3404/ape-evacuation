import { Fragment } from "react";
import { Polyline, Tooltip } from "react-leaflet";

function RouteLines({ routes = [], nodes = [], edges = [] }) {
  if (!routes.length) return null;

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.node_id, node]));

  return (
    <>
      {routes.map((route, routeIndex) => (
        <Fragment key={`route-group-${routeIndex}`}>
          {/* Garis rute utama */}
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: route.color,
              weight: 5,
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
