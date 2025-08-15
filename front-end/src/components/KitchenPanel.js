import React, { useEffect, useState } from "react";
import API from "../api";

export default function KitchenPanel() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    API.get("/orders").then((res) => setOrders(res.data));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // refresh every 3s
    return () => clearInterval(interval);
  }, []);

  return (
<div className="panel">
<h2>Kitchen Panel</h2>
<ul>
      {orders.map((o) => (
          <li className="cart-item" key={o.id}>
          <b>Order #{o.id}</b> - Table {o.table_id} - Status: {o.status}
        </li>
      ))}
          </ul>

    </div>
  );
}
