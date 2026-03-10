import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then(res => setOrders(res.data));
  }, []);

  return (
    <div className="container">
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map(order => (
        <div className="card" key={order.id}>
          <strong>Order #{order.orderNumber}</strong>

          <ul>
            {order.orderLineItemsList.map(item => (
              <li key={item.id}>
                {item.skuCode} — Qty: {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
