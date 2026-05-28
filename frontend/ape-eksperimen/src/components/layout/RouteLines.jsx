import { Polyline } from "react-leaflet";

function RouteLines({ routes }) {
  if (!routes?.length) {
    return null;
  }

  return (
    <>
      {routes.map((route, index) => (
        <Polyline
          key={index}
          positions={route.geometry}
          pathOptions={{
            color: route.color,
            weight: 5,
          }}
        />
      ))}
    </>
  );
}

export default RouteLines;
