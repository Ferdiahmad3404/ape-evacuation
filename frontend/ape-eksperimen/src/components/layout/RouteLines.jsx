import { Polyline } from "react-leaflet";

function RouteLines({ routes }) {
  if (!routes?.length) {
    return null;
  }

  return (
    <>
      {routes.map((route, routeIndex) =>
        route.geometry?.map((segment, segmentIndex) => (
          <Polyline
            key={`${routeIndex}-${segmentIndex}`}
            positions={segment}
            pathOptions={{
              color: route.color,
              weight: 5,
            }}
          />
        )),
      )}
    </>
  );
}

export default RouteLines;
