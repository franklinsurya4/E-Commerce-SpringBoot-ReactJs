import { GoogleMap, Marker } from "@react-google-maps/api";
import { useState } from "react";

const center = { lat: 13.0827, lng: 80.2707 };

export default function GoogleMapPicker({ setLocation, isLoaded }) {
  const [marker, setMarker] = useState(center);

  if (!isLoaded) return <div>Loading map...</div>;

  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setLocation({ lat, lng });
  };

  return (
    <GoogleMap
      zoom={12}
      center={center}
      mapContainerStyle={{ width: "100%", height: "300px" }}
      onClick={handleClick}
    >
      <Marker position={marker} />
    </GoogleMap>
  );
}