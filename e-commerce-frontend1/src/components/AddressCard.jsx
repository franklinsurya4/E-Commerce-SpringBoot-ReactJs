export default function AddressCard({ address }) {
  return (
    <div className="address-card">
      <h3>{address.name}</h3>
      <p>{address.street}</p>
      <p>{address.city}, {address.state}</p>
      <p>{address.country} - {address.pincode}</p>
      <p>📞 {address.phone}</p>
      {address.latitude && address.longitude && (
        <p style={{ fontSize: "12px", color: "#888" }}>
          📍 {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}