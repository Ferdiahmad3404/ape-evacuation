import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapFlyTo({ center, zoom = 15 }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.flyTo(center, zoom, {
      duration: 1,
    });
  }, [center, zoom, map]);

  return null;
}

export default MapFlyTo;
